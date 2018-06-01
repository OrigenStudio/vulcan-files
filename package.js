Package.describe({
  name: 'origenstudio:vulcan-files',
  version: '0.0.2',
  summary: 'Provides Vulcan with the capability of uploading files to server using Meteor-Files',
  git: 'https://github.com/OrigenStudio/vulcan-files',
  documentation: 'README.md'
});

Package.onUse(api => {
  api.versionsFrom('1.6.0.1');

  api.use([
    'ecmascript',
    'vulcan:core@1.10.1',
    'ostrio:files@1.9.11',
    'origenstudio:files-helpers@0.0.1'
  ]);

  api.mainModule('lib/server/main.js', 'server');
  api.mainModule('lib/client/main.js', 'client');
});
