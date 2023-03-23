// Styles
import 'mini.css/dist/mini-dark.css';

// Other imports
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import FrayToolsPluginCore from '@fraytools/plugin-core';
import FraymakersMetadata from './FraymakersMetadata';
import { IManifestJson } from '@fraytools/plugin-core/lib/types';
import { IFraymakersMetadataConfig } from './types';

const semverCompare = require('semver-compare');

declare var MANIFEST_JSON:IManifestJson;

// Informs FrayToolsPluginCore of the default config metadata for plugin when it first gets initialized
FrayToolsPluginCore.PLUGIN_CONFIG_METADATA_DEFAULTS = FraymakersMetadata.getDefaultSettings();


FrayToolsPluginCore.migrationHandler = (configMetadata:IFraymakersMetadataConfig) => {
  // Compare configMetadata.version here with your latest manifest version and perform any necessary migrations for compatibility
  if (!configMetadata.version || semverCompare(configMetadata.version, '0.0.11') <= 0) {
    configMetadata.version = '0.0.12';
    configMetadata.collisionBodyLayerPresets = [];
  }
  if (semverCompare(configMetadata.version, '0.0.19') <= 0) {
    configMetadata.version = '0.0.20';
    configMetadata.activeCollisionBoxLayerPreset = null;
    configMetadata.collisionBoxLayerPresets = [];
  }
  if (semverCompare(configMetadata.version, '0.1.0') <= 0) {
    // Delete legacy holdbox presets
    configMetadata.version = '0.1.1';
    for (let i = 0; i < configMetadata.collisionBoxLayerPresets.length; i++) {
      let preset = configMetadata.collisionBoxLayerPresets[i];
      delete preset['holdboxColor'];
      delete preset['holdboxAlpha'];
    }
  }

  configMetadata.version = MANIFEST_JSON.version;
};
FrayToolsPluginCore.setupHandler = (props) => {
  // Create a new container for the plugin
  var appContainer = document.createElement('div');
  appContainer.className = 'FraymakersMetadataWrapper';
  document.body.appendChild(appContainer);

  // Load the component with its props into the document body
  ReactDOM.render(<FraymakersMetadata {...props} />, appContainer);
};
