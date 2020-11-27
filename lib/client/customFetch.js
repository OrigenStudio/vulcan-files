/**
 * A Fetch implementation that supports upload tracking
 *
 * To be used only in this specific scenario, prefer normal fetch as a default and during SSR
 * @see https://github.com/jaydenseric/apollo-upload-client/issues/88
 * 
 * @example
 * export const Default = withMp3FileUpload(({ mutate }) => {
  const [file, setFile] = useState<null | File>(null);
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    if (!mutate || !file) {
      return;
    }
    let abort: any;
    mutate({
      variables: {
        file
      },
      context: {
        fetchOptions: {
          useUpload: true,
          onProgress: (ev: ProgressEvent) => {
            setProgress(ev.loaded / ev.total);
          },
          onAbortPossible: (abortHandler: any) => {
            abort = abortHandler;
          }
        }
      }
    }).catch(err => console.log(err));

    return () => {
      if (abort) {
        abort();
      }
    };
  }, [file]);
}
 */

const parseHeaders = (rawHeaders) => {
  const headers = new Headers();
  // Replace instances of \r\n and \n followed by at least one space or horizontal tab with a space
  // https://tools.ietf.org/html/rfc7230#section-3.2
  const preProcessedHeaders = rawHeaders.replace(/\r?\n[\t ]+/g, " ");
  preProcessedHeaders.split(/\r?\n/).forEach((line) => {
    const parts = line.split(":");
    const key = parts.shift().trim();
    if (key) {
      const value = parts.join(":").trim();
      headers.append(key, value);
    }
  });
  return headers;
};

export const uploadFetch = (url, options) =>
  new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = () => {
      const opts = {
        status: xhr.status,
        statusText: xhr.statusText,
        headers: parseHeaders(xhr.getAllResponseHeaders() || ""),
      };
      opts.url =
        "responseURL" in xhr
          ? xhr.responseURL
          : opts.headers.get("X-Request-URL");
      const body = "response" in xhr ? xhr.response : xhr.responseText;
      resolve(new Response(body, opts));
    };
    xhr.onerror = () => {
      reject(new TypeError("Network request failed"));
    };
    xhr.ontimeout = () => {
      reject(new TypeError("Network request failed"));
    };
    xhr.open(options.method, url, true);

    Object.keys(options.headers).forEach((key) => {
      xhr.setRequestHeader(key, options.headers[key]);
    });

    if (xhr.upload) {
      xhr.upload.onprogress = options.onProgress;
    }

    if (options.onAbortPossible) {
      options.onAbortPossible(() => {
        xhr.abort();
      });
    }

    xhr.send(options.body);
  });

export const customFetch = (uri, options) => {
  if (typeof window !== "undefined" && options.useUpload) {
    return uploadFetch(uri, options);
  }
  return fetch(uri, options);
};
