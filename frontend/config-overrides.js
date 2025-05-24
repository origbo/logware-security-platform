const { override, addWebpackModuleRule } = require('customize-cra');

module.exports = override(
  // Add specific rule to handle ESM modules from MUI
  function(config) {
    // Add resolve alias for problematic MUI imports
    if (!config.resolve) config.resolve = {};
    if (!config.resolve.alias) config.resolve.alias = {};
    
    // Add aliases for common MUI paths
    config.resolve.alias['@mui/material/styles'] = '@mui/material';
    config.resolve.alias['@mui/system/RtlProvider'] = '@mui/system';
    config.resolve.alias['@mui/material/utils'] = '@mui/material';
    config.resolve.alias['@mui/x-data-grid/esm'] = '@mui/x-data-grid';
    
    // Add extensions to ensure all file types are properly resolved
    config.resolve.extensions = [
      '.js', '.jsx', '.ts', '.tsx', '.mjs', '.json', 
      ...(config.resolve.extensions || [])
    ];
    
    // Add fallback for date-fns subpath imports
    if (!config.resolve.fallback) config.resolve.fallback = {};
    
    // Enable importing with or without extension
    config.resolve.extensionAlias = {
      '.js': ['.ts', '.tsx', '.js', '.jsx']
    };

    // Add rule to handle .mjs files and set fullySpecified to false
    if (!config.module) config.module = {};
    if (!config.module.rules) config.module.rules = [];
    
    config.module.rules.push({
      test: /\.m?js$/,
      resolve: {
        fullySpecified: false // Key setting for ES Modules
      },
    });
    
    return config;
  }
);
