import { createBatchingNetworkInterface } from 'apollo-client';
import { print } from 'graphql';
import RecursiveIterator from 'recursive-iterator';

export function printRequest(request) {
  return Object.assign({}, request, { query: print(request.query) });
}

if (Meteor.isClient && window.fetch) {
  const originalFetch = window.fetch;
  window.fetch = function fetch(input, init) {
    const options = init ? { ...init } : {};
    if (options.headers && typeof options.headers['Content-Type'] === typeof undefined) {
      delete options.headers['Content-Type'];
    }
    return originalFetch(input, options);
  };
}

function isUpload(request) {
  if (Array.isArray(request)) {
    return request.map(isUpload).reduce((p, c) => p || c, false);
  }

  if (request.variables) {
    for (const { node } of new RecursiveIterator(request.variables)) {
      if (node instanceof FileList || node instanceof File) {
        return true;
      }
    }
  }

  return false;
}

function serializeFormData(obj, formDataObj = {}, namespace) {
  function serializeValue(value, formKey) {
    if (
      typeof value === 'object' &&
      !(value instanceof File) &&
      !(value instanceof FileList) &&
      !(value instanceof Date)
    ) {
      serializeFormData(value, formDataObj, formKey);
    } else if (typeof value === 'object' && value instanceof Date) {
      formDataObj[formKey] = value.toISOString();
    } else {
      formDataObj[formKey] = value;
    }
  }

  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      const formKey = namespace ? `${namespace}[${i}]` : `[${i}]`;
      serializeValue(obj[i], formKey);
    }
  } else if (obj instanceof Object) {
    Object.entries(obj).forEach(([property, value]) => {
      let formKey;
      if (namespace) {
        formKey = `${namespace}[${property}]`;
      } else {
        formKey = property;
      }
      serializeValue(value, formKey);
    });
  }
  return formDataObj;
}

// DEPRECATED with apollo 2
//export const fileUploadMiddleware = {
//  applyMiddleware({ request, options }, next) {
//    if (isUpload(request)) {
//      const body = new FormData();
//      const data = [];
//      const printed = printRequest(request);
//      data.push({
//        operationName: printed.operationName || undefined,
//        debugName: printed.debugName || undefined,
//        query: printed.query,
//        variables: request.variables || {}
//      });
//      const serialised = serializeFormData({ data });
//      Object.entries(serialised).forEach(([name, value]) => {
//        if (typeof value !== typeof undefined) {
//          body.set(name, value);
//        }
//      });
//      options.headers = options.headers || new Headers();
//      options.headers.Accept = '*/*';
//      options.headers['Content-Type'] = undefined;
//      options.body = body;
//    }
//    next();
//  },
//  applyBatchMiddleware({ requests, options }, next) {
//    if (isUpload(requests)) {
//      const body = new FormData();
//      const data = [];
//      requests.forEach((request, i) => {
//        const printed = printRequest(request);
//        data.push({
//          operationName: printed.operationName || undefined,
//          debugName: printed.debugName || undefined,
//          query: printed.query,
//          variables: request.variables || {}
//        });
//      });
//      const serialised = serializeFormData({ data });
//      Object.entries(serialised).forEach(([name, value]) => {
//        if (typeof value !== typeof undefined) {
//          body.set(name, value);
//        }
//      });
//      options.headers = options.headers || new Headers();
//      options.headers.Accept = '*/*';
//      options.headers['Content-Type'] = undefined;
//      options.body = body;
//    }
//    next();
//  }
//};

export function createUploadNetworkInterface(opts) {
  const batchedInterface = createBatchingNetworkInterface(opts);
  batchedInterface.use([fileUploadMiddleware]);
  return batchedInterface;
}
