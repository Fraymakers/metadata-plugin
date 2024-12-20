// Other imports
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as _ from 'lodash';
import './FraymakersMetadata.scss';
import BaseTypeDefinitionPlugin, { IMetadataDefinitionPluginProps, IMetadataDefinitionPluginState } from '@fraytools/plugin-core/lib/base/BaseMetadataDefinitionPlugin';
import FrayToolsPluginCore from '@fraytools/plugin-core/lib/FrayToolsPluginCore';
import CollisionBodyLayerPresetsEditor from './CollisionBodyLayerPresetsEditor';
import CollisionBoxLayerPresetsEditor, { BOX_TYPES_MAP } from './CollisionBoxLayerPresetsEditor';
import { IManifestJson, IMetadataDefinition, IMetadataDefinitionConditional, IMetadataDefinitionDropdownFieldData, IMetadataDefinitionDropdownFieldDataOptions, IMetadataDefinitionEffect } from '@fraytools/plugin-core/lib/types';
import { CollisionBodyLayerPreset, CollisionBoxLayerPreset, IFraymakersMetadataConfig, IFraymakersMetadataPluginAssetMetadata } from './types';
import { ILibraryAssetMetadata, ISpriteEntityAssetMetadata, KeyframeTypes, LayerTypes } from '@fraytools/plugin-core/lib/types/fraytools';

const semverCompare = require('semver-compare');

declare var MANIFEST_JSON:IManifestJson;

interface IFraymakersMetadataProps extends IMetadataDefinitionPluginProps {
  configMetadata:IFraymakersMetadataConfig;
  assetMetadata: IFraymakersMetadataPluginAssetMetadata;
}
interface IFraymakersMetadataState extends IMetadataDefinitionPluginState {
  collisionBodyLayerPresets:CollisionBodyLayerPreset[]
}

/**
 * Settings editor for Fraymakers Api Types plugin.
 */
export default class FraymakersMetadata extends BaseTypeDefinitionPlugin<IFraymakersMetadataProps, IFraymakersMetadataState> {
  constructor(props) {
    super(props);

    this.state = {
      collisionBodyLayerPresets: this.props.configMetadata.collisionBodyLayerPresets || []
    };
  }
  
  public static getDefaultSettings():IFraymakersMetadataConfig {
    return {
      version: MANIFEST_JSON.version,
      collisionBodyLayerPresets: [],
      activeCollisionBoxLayerPreset: null,
      collisionBoxLayerPresets: []
    };
  }

  /**
   * Force this component to re-render when parent window sends new props
   */
  onPropsUpdated(props) {
    ReactDOM.render(<FraymakersMetadata {...props} />, document.querySelector('.FraymakersMetadataWrapper'));
  }
  
  /**
   * This function will be called automatically when a the parent requests the metadata definitions.
   */
   onMetadataDefinitionRequest() {
    // Return metadata definitions
    var definitions:IMetadataDefinition[] = [];
    
    // Grant sprite type drop down to Sprite Entity assets
    definitions.push(
      {
        metadataOwnerTypes: ['SPRITE_ENTITY_ASSET_METADATA'],
        fields: [{
          name: 'objectType',
          label: 'Object Type',
          type: 'DROPDOWN',
          defaultValue: 'NONE',
          options: [
            { label: 'None', value: 'NONE' },
            { label: 'Character', value: 'CHARACTER' },
            { label: 'Projectile', value: 'PROJECTILE' },
            // { label: 'Item', value: 'ITEM' }, // TODO
            { label: 'Assist', value: 'ASSIST' },
            { label: 'Stage', value: 'STAGE' },
            { label: 'Collision Area', value: 'COLLISION_AREA' },
            ...this.getRectCollisionAreaDropdownOptions(),
            ...this.getRectStructureDropdownOptions(),
            ...this.getLineSegmentStructureDropdownOptions(),
            { label: 'Match Rules', value: 'MATCH_RULES' },
            { label: 'Custom Game Object', value: 'CUSTOM_GAME_OBJECT' }
          ],
          dependsOn: []
        },{
          name: 'spritesheetGroup',
          label: 'Spritesheet Group',
          type: 'TEXT',
          defaultValue: '',
          dependsOn: []
        }],
        effects: []
      },
      {
        metadataOwnerTypes: ['SCRIPT_ASSET_METADATA'],
        fields: [{
          name: 'objectType',
          label: 'Object Type',
          type: 'DROPDOWN',
          defaultValue: 'NONE',
          options: [
            { label: 'None', value: 'NONE' },
            { label: 'Character', value: 'CHARACTER' },
            { label: 'Projectile', value: 'PROJECTILE' },
            // { label: 'Item', value: 'ITEM' }, // TODO
            { label: 'Assist', value: 'ASSIST' },
            { label: 'Stage', value: 'STAGE' },
            { label: 'Collision Area', value: 'COLLISION_AREA' },
            ...this.getRectCollisionAreaDropdownOptions(),
            ...this.getRectStructureDropdownOptions(),
            ...this.getLineSegmentStructureDropdownOptions(),
            { label: 'Match Rules', value: 'MATCH_RULES' },
            { label: 'Custom Game Object', value: 'CUSTOM_GAME_OBJECT' }
          ],
          dependsOn: []
        }],
        effects: []
      },
      {
        metadataOwnerTypes: ['AUDIO_ASSET_METADATA'],
        fields: [{
          name: 'categories',
          label: 'Categories',
          type: 'TAGS',
          defaultValue: [],
          dependsOn: []
        }],
        effects: []
      },
      {
        metadataOwnerTypes: ['NINE_SLICE_ASSET_METADATA'],
        fields: [{
          name: 'spritesheetGroup',
          label: 'Spritesheet Group',
          type: 'TEXT',
          defaultValue: '',
          dependsOn: []
        }],
        effects: []
      },
    );
    
    // Custom palette collection fields
    definitions.push(
      {
        metadataOwnerTypes: ['PALETTE_MAP_METADATA'],
        fields: [{
          name: 'isBase',
          label: 'Base Costume',
          type: 'BOOLEAN',
          defaultValue: false,
          dependsOn: []
        },{
          name: 'teamColor',
          label: 'Team Color',
          type: 'DROPDOWN',
          defaultValue: 'NONE',
          options: [
            { label: 'None', value: 'NONE' },
            { label: 'Red', value: 'RED' },
            { label: 'Green', value: 'GREEN' },
            { label: 'Blue', value: 'BLUE' }
          ],
          dependsOn: []
        }],
        effects: []
      }
    );

    if (this.props.assetMetadata.pluginMetadata['com.fraymakers.FraymakersMetadata']) {
      if (this.props.assetMetadata.pluginMetadata['com.fraymakers.FraymakersMetadata'].objectType === 'CHARACTER' || this.props.assetMetadata.pluginMetadata['com.fraymakers.FraymakersMetadata'].objectType === 'PROJECTILE' || this.props.assetMetadata.pluginMetadata['com.fraymakers.FraymakersMetadata'].objectType === 'ASSIST' || this.props.assetMetadata.pluginMetadata['com.fraymakers.FraymakersMetadata'].objectType === 'CUSTOM_GAME_OBJECT' || this.props.assetMetadata.pluginMetadata['com.fraymakers.FraymakersMetadata'].objectType === 'ENTITY') {
        // Universal game object metadata
        definitions.push(
          {
            metadataOwnerTypes: ['COLLISION_BOX_LAYER_METADATA'],
            fields: [{
              name: 'collisionBoxType',
              label: 'Collision Box Type',
              type: 'DROPDOWN',
              defaultValue: 'NONE',
              options: [
                { label: 'None', value: 'NONE' },
                { label: 'Hurt Box', value: 'HURT_BOX' },
                { label: 'Hit Box', value: 'HIT_BOX' },
                { label: 'Grab Box', value: 'GRAB_BOX' },
                { label: 'Ledge Grab Box', value: 'LEDGE_GRAB_BOX' },
                { label: 'Reflect Box', value: 'REFLECT_BOX' },
                { label: 'Absorb Box', value: 'ABSORB_BOX' },
                { label: 'Counter Box', value: 'COUNTER_BOX' },
                { label: 'Custom Box A', value: 'CUSTOM_BOX_A' },
                { label: 'Custom Box B', value: 'CUSTOM_BOX_B' },
                { label: 'Custom Box C', value: 'CUSTOM_BOX_C' }
              ],
              dependsOn: []
            },{
              name: 'index',
              label: 'Index',
              type: 'INTEGER',
              defaultValue: 0,
              dependsOn: [
                {
                  inputField: 'pluginMetadata[].collisionBoxType',
                  operator: 'matches()',
                  inputValue: 'HIT_BOX|HURT_BOX|GRAB_BOX|LEDGE_GRAB_BOX|REFLECT_BOX|ABSORB_BOX|COUNTER_BOX|CUSTOM_BOX_A|CUSTOM_BOX_B|CUSTOM_BOX_C'
                }
              ]
            }],
            effects: [
              // Ensure index field always exist so that we can populate the layer name with it
              {
                dependsOn: [
                  {
                    inputField: 'pluginMetadata[].collisionBoxType',
                    operator: 'matches()',
                    inputValue: 'HIT_BOX|HURT_BOX|GRAB_BOX|LEDGE_GRAB_BOX|REFLECT_BOX|ABSORB_BOX|COUNTER_BOX|CUSTOM_BOX_A|CUSTOM_BOX_B|CUSTOM_BOX_C'
                  },
                  {
                    inputField: 'pluginMetadata[].index',
                    operator: '=',
                    inputValue: undefined
                  }
                ],
                outputField: 'pluginMetadata[].index',
                outputValue: 0
              },
              // Colors+alpha for collision boxes
              ...this.getCollisionBoxLayerPresetFor('HIT_BOX'),
              ...this.getCollisionBoxLayerPresetFor('HURT_BOX'),
              ...this.getCollisionBoxLayerPresetFor('GRAB_BOX'),
              ...this.getCollisionBoxLayerPresetFor('LEDGE_GRAB_BOX'),
              ...this.getCollisionBoxLayerPresetFor('REFLECT_BOX'),
              ...this.getCollisionBoxLayerPresetFor('ABSORB_BOX'),
              ...this.getCollisionBoxLayerPresetFor('COUNTER_BOX'),
              ...this.getCollisionBoxLayerPresetFor('CUSTOM_BOX_A'),
              ...this.getCollisionBoxLayerPresetFor('CUSTOM_BOX_B'),
              ...this.getCollisionBoxLayerPresetFor('CUSTOM_BOX_C'),
              // Naming for collision boxes
              {
                dependsOn: [
                  {
                    inputField: 'pluginMetadata[].collisionBoxType',
                    operator: '=',
                    inputValue: 'HURT_BOX'
                  }
                ],
                outputField: 'name',
                outputValue: 'hurtbox{{pluginMetadata[].index}}'
              },
              {
                dependsOn: [
                  {
                    inputField: 'pluginMetadata[].collisionBoxType',
                    operator: '=',
                    inputValue: 'HIT_BOX'
                  }
                ],
                outputField: 'name',
                outputValue: 'hitbox{{pluginMetadata[].index}}'
              },
              {
                dependsOn: [
                  {
                    inputField: 'pluginMetadata[].collisionBoxType',
                    operator: '=',
                    inputValue: 'GRAB_BOX'
                  }
                ],
                outputField: 'name',
                outputValue: 'grabbox{{pluginMetadata[].index}}'
              },
              {
                dependsOn: [
                  {
                    inputField: 'pluginMetadata[].collisionBoxType',
                    operator: '=',
                    inputValue: 'LEDGE_GRAB_BOX'
                  }
                ],
                outputField: 'name',
                outputValue: 'ledgegrabbox{{pluginMetadata[].index}}'
              },
              {
                dependsOn: [
                  {
                    inputField: 'pluginMetadata[].collisionBoxType',
                    operator: '=',
                    inputValue: 'REFLECT_BOX'
                  }
                ],
                outputField: 'name',
                outputValue: 'reflectbox{{pluginMetadata[].index}}'
              },
              {
                dependsOn: [
                  {
                    inputField: 'pluginMetadata[].collisionBoxType',
                    operator: '=',
                    inputValue: 'ABSORB_BOX'
                  }
                ],
                outputField: 'name',
                outputValue: 'absorbbox{{pluginMetadata[].index}}'
              },
              {
                dependsOn: [
                  {
                    inputField: 'pluginMetadata[].collisionBoxType',
                    operator: '=',
                    inputValue: 'COUNTER_BOX'
                  }
                ],
                outputField: 'name',
                outputValue: 'counterbox{{pluginMetadata[].index}}'
              },
              {
                dependsOn: [
                  {
                    inputField: 'pluginMetadata[].collisionBoxType',
                    operator: '=',
                    inputValue: 'CUSTOM_BOX_A'
                  }
                ],
                outputField: 'name',
                outputValue: 'customboxa{{pluginMetadata[].index}}'
              },
              {
                dependsOn: [
                  {
                    inputField: 'pluginMetadata[].collisionBoxType',
                    operator: '=',
                    inputValue: 'CUSTOM_BOX_B'
                  }
                ],
                outputField: 'name',
                outputValue: 'customboxb{{pluginMetadata[].index}}'
              },
              {
                dependsOn: [
                  {
                    inputField: 'pluginMetadata[].collisionBoxType',
                    operator: '=',
                    inputValue: 'CUSTOM_BOX_C'
                  }
                ],
                outputField: 'name',
                outputValue: 'customboxc{{pluginMetadata[].index}}'
              }
            ]
          },
          {
            metadataOwnerTypes: ['POINT_LAYER_METADATA'],
            fields: [{
              name: 'pointType',
              label: 'Point Type',
              type: 'DROPDOWN',
              defaultValue: 'NONE',
              options: [
                { label: 'None', value: 'NONE' },
                { label: 'Grab Hold Point', value: 'GRAB_HOLD_POINT' },
                { label: 'Ledge Hold Point', value: 'LEDGE_HOLD_POINT' },
                { label: 'Pivot Point', value: 'PIVOT_POINT' },
                { label: 'Autolink Point', value: 'AUTOLINK_POINT' },
                { label: 'Custom Box A', value: 'CUSTOM_BOX_A' },
                { label: 'Custom Box B', value: 'CUSTOM_BOX_B' },
                { label: 'Custom Box C', value: 'CUSTOM_BOX_C' }
              ],
              dependsOn: []
            },{
              name: 'index',
              label: 'Index',
              type: 'INTEGER',
              defaultValue: 0,
              dependsOn: [
                {
                  inputField: 'pluginMetadata[].pointType',
                  operator: 'matches()',
                  inputValue: 'CUSTOM_BOX_A|CUSTOM_BOX_B|CUSTOM_BOX_C'
                }
              ]
            }],
            effects: [
              // Ensure index field always exist so that we can populate the layer name with it
              {
                dependsOn: [
                  {
                    inputField: 'pluginMetadata[].pointType',
                    operator: 'matches()',
                    inputValue: 'CUSTOM_BOX_A|CUSTOM_BOX_B|CUSTOM_BOX_C'
                  },
                  {
                    inputField: 'pluginMetadata[].index',
                    operator: '=',
                    inputValue: undefined
                  }
                ],
                outputField: 'pluginMetadata[].index',
                outputValue: 0
              },
              // Populate layer name
              {
                dependsOn: [
                  {
                    inputField: 'pluginMetadata[].pointType',
                    operator: '=',
                    inputValue: 'GRAB_HOLD_POINT'
                  }
                ],
                outputField: 'name',
                outputValue: 'grabholdpoint0'
              },
              {
                dependsOn: [
                  {
                    inputField: 'pluginMetadata[].pointType',
                    operator: '=',
                    inputValue: 'LEDGE_HOLD_POINT'
                  }
                ],
                outputField: 'name',
                outputValue: 'ledgeholdpoint0'
              },
              {
                dependsOn: [
                  {
                    inputField: 'pluginMetadata[].pointType',
                    operator: '=',
                    inputValue: 'PIVOT_POINT'
                  }
                ],
                outputField: 'name',
                outputValue: 'pivotpoint0'
              },
              {
                dependsOn: [
                  {
                    inputField: 'pluginMetadata[].pointType',
                    operator: '=',
                    inputValue: 'AUTOLINK_POINT'
                  }
                ],
                outputField: 'name',
                outputValue: 'autolinkpoint0'
              },
              {
                dependsOn: [
                  {
                    inputField: 'pluginMetadata[].pointType',
                    operator: '=',
                    inputValue: 'CUSTOM_BOX_A'
                  }
                ],
                outputField: 'name',
                outputValue: 'customboxa{{pluginMetadata[].index}}'
              },
              {
                dependsOn: [
                  {
                    inputField: 'pluginMetadata[].pointType',
                    operator: '=',
                    inputValue: 'CUSTOM_BOX_B'
                  }
                ],
                outputField: 'name',
                outputValue: 'customboxb{{pluginMetadata[].index}}'
              },
              {
                dependsOn: [
                  {
                    inputField: 'pluginMetadata[].pointType',
                    operator: '=',
                    inputValue: 'CUSTOM_BOX_C'
                  }
                ],
                outputField: 'name',
                outputValue: 'customboxc{{pluginMetadata[].index}}'
              }
            ]
          },
          {
            metadataOwnerTypes: ['COLLISION_BODY_LAYER_METADATA'],
            fields: [{
              name: 'collisionBodyLayerPresets',
              label: 'ECB Preset',
              type: 'DROPDOWN',
              defaultValue: 'NONE',
              options: this.getCollisionBodyLayerPresetOptions([
                { label: 'None', value: 'NONE' }
              ]),
              dependsOn: []
            }],
            effects: this.getCollisionBodyLayerPresetEffects([])
          },
          {
            metadataOwnerTypes: ['COLLISION_BODY_SYMBOL_METADATA'],
            fields: [],
            effects: [
              {
                dependsOn: [],
                outputField: 'x',
                outputValue: 0 // Help force collision body to 0, since the game engine does not support offsetting its X position
              }
            ]
          }
        );
      }
      
      if (this.props.assetMetadata.pluginMetadata['com.fraymakers.FraymakersMetadata'].objectType === 'STAGE') {
        // Stage sprite metadata
        definitions.push(
          {
            metadataOwnerTypes: ['COLLISION_BOX_LAYER_METADATA'],
            fields: [{
              name: 'collisionBoxType',
              label: 'Collision Box Type',
              type: 'DROPDOWN',
              defaultValue: 'NONE',
              options: [
                { label: 'None', value: 'NONE' },
                { label: 'Death Box', value: 'DEATH_BOX' },
                { label: 'Camera Box', value: 'CAMERA_BOX' },
                ...this.getRectCollisionAreaDropdownOptions(),
                ...this.getRectStructureDropdownOptions()
              ],
              dependsOn: []
            }],
            effects: [
              ...this.getRectCollisionAreaEffects(),
              ...this.getRectStructureEffects(),
              {
                dependsOn: [
                  {
                    inputField: 'pluginMetadata[].collisionBoxType',
                    operator: 'matches()',
                    inputValue: 'DEATH_BOX|CAMERA_BOX|RECT_COLLISION_AREA|RECT_STRUCTURE'
                  }
                ],
                outputField: 'defaultAlpha',
                outputValue: 0.5
              },
              {
                dependsOn: [
                  {
                    inputField: 'pluginMetadata[].collisionBoxType',
                    operator: '=',
                    inputValue: 'RECT_COLLISION_AREA'
                  }
                ],
                outputField: 'defaultColor',
                outputValue: '0xff8585'
              },
              {
                dependsOn: [
                  {
                    inputField: 'pluginMetadata[].collisionBoxType',
                    operator: '=',
                    inputValue: 'RECT_STRUCTURE'
                  }
                ],
                outputField: 'defaultColor',
                outputValue: '0x00ff00'
              },
              {
                dependsOn: [
                  {
                    inputField: 'pluginMetadata[].collisionBoxType',
                    operator: '=',
                    inputValue: 'DEATH_BOX'
                  }
                ],
                outputField: 'name',
                outputValue: 'Death Box'
              },
              {
                dependsOn: [
                  {
                    inputField: 'pluginMetadata[].collisionBoxType',
                    operator: '=',
                    inputValue: 'DEATH_BOX'
                  }
                ],
                outputField: 'defaultColor',
                outputValue: '0xd1d1d1'
              },
              {
                dependsOn: [
                  {
                    inputField: 'pluginMetadata[].collisionBoxType',
                    operator: '=',
                    inputValue: 'CAMERA_BOX'
                  }
                ],
                outputField: 'name',
                outputValue: 'Camera Box'
              },
              {
                dependsOn: [
                  {
                    inputField: 'pluginMetadata[].collisionBoxType',
                    operator: '=',
                    inputValue: 'CAMERA_BOX'
                  }
                ],
                outputField: 'defaultColor',
                outputValue: '0xd1d1d1'
              }
            ]
          },
          ...this.getCollisionBoxSymbolStructureMetadataDefinitions(),
          {
            metadataOwnerTypes: ['POINT_LAYER_METADATA'],
            fields: [{
              name: 'pointType',
              label: 'Point Type',
              type: 'DROPDOWN',
              defaultValue: 'NONE',
              options: [
                { label: 'None', value: 'NONE' },
                { label: 'Entrance Point', value: 'ENTRANCE_POINT' },
                { label: 'Respawn Point', value: 'RESPAWN_POINT' },
                { label: 'Shadow Light Point', value: 'SHADOW_LIGHT_POINT' }
              ],
              dependsOn: []
            },{
              name: 'index',
              label: 'Index',
              type: 'INTEGER',
              defaultValue: 0,
              dependsOn: [
                {
                  inputField: 'pluginMetadata[].pointType',
                  operator: 'matches()',
                  inputValue: 'ENTRANCE_POINT|RESPAWN_POINT'
                }
              ]
            },{
              name: 'shadowLayerIds',
              label: 'Shadow Layer Ids',
              type: 'TAGS',
              defaultValue: [],
              dependsOn: [
                {
                  inputField: 'pluginMetadata[].pointType',
                  operator: 'matches()',
                  inputValue: 'SHADOW_LIGHT_POINT'
                }
              ]
            },{
              name: 'shadowHeightMultiplier',
              label: 'Shadow Height Multiplier',
              type: 'FLOAT',
              defaultValue: 0.25,
              dependsOn: [
                {
                  inputField: 'pluginMetadata[].pointType',
                  operator: 'matches()',
                  inputValue: 'SHADOW_LIGHT_POINT'
                }
              ]
            },{
              name: 'shadowFadeStartRadius',
              label: 'Shadow Fade Start Radius',
              type: 'FLOAT',
              defaultValue: 0,
              dependsOn: [
                {
                  inputField: 'pluginMetadata[].pointType',
                  operator: 'matches()',
                  inputValue: 'SHADOW_LIGHT_POINT'
                }
              ]
            },{
              name: 'shadowFadeEndRadius',
              label: 'Shadow Fade End Radius',
              type: 'FLOAT',
              defaultValue: -1,
              dependsOn: [
                {
                  inputField: 'pluginMetadata[].pointType',
                  operator: 'matches()',
                  inputValue: 'SHADOW_LIGHT_POINT'
                }
              ]
            }],
            effects: [
              // Ensure index field always exist so that we can populate the layer name with it
              {
                dependsOn: [
                  {
                    inputField: 'pluginMetadata[].pointType',
                    operator: 'matches()',
                    inputValue: 'ENTRANCE_POINT|RESPAWN_POINT|SHADOW_LIGHT_POINT'
                  },
                  {
                    inputField: 'pluginMetadata[].index',
                    operator: '=',
                    inputValue: undefined
                  }
                ],
                outputField: 'pluginMetadata[].index',
                outputValue: 0
              },
              // Populate layer name
              {
                dependsOn: [
                  {
                    inputField: 'pluginMetadata[].pointType',
                    operator: '=',
                    inputValue: 'ENTRANCE_POINT'
                  }
                ],
                outputField: 'name',
                outputValue: 'Entrance {{pluginMetadata[].index}}'
              },
              {
                dependsOn: [
                  {
                    inputField: 'pluginMetadata[].pointType',
                    operator: '=',
                    inputValue: 'RESPAWN_POINT'
                  }
                ],
                outputField: 'name',
                outputValue: 'Respawn {{pluginMetadata[].index}}'
              }
            ]
          },
          {
            metadataOwnerTypes: ['LINE_SEGMENT_LAYER_METADATA'],
            fields: [{
              name: 'lineSegmentType',
              label: 'Line Segment Type',
              type: 'DROPDOWN',
              defaultValue: 'NONE',
              options: [
                { label: 'None', value: 'NONE' },
                ...this.getLineSegmentStructureDropdownOptions()
              ],
              dependsOn: []
            }],
            effects: []
          },
          ...this.getLineSegmentSymbolStructureMetadataDefinitions(),
          {
            metadataOwnerTypes: ['CONTAINER_LAYER_METADATA'],
            fields: [{
              name: 'containerType',
              label: 'Container Type',
              type: 'DROPDOWN',
              defaultValue: 'NONE',
              options: [
                { label: 'None', value: 'NONE' },
                { label: 'Background Behind', value: 'BACKGROUND_BEHIND_CONTAINER' },
                { label: 'Background Structures', value: 'BACKGROUND_STRUCTURES_CONTAINER' },
                { label: 'Background Shadows', value: 'BACKGROUND_SHADOWS_CONTAINER' },
                { label: 'Background Effects', value: 'BACKGROUND_EFFECTS_CONTAINER' },
                { label: 'Characters Back', value: 'CHARACTERS_BACK_CONTAINER' },
                { label: 'Characters', value: 'CHARACTERS_CONTAINER' },
                { label: 'Characters Front', value: 'CHARACTERS_FRONT_CONTAINER' },
                { label: 'Foreground Structures', value: 'FOREGROUND_STRUCTURES_CONTAINER' },
                { label: 'Foreground Shadows', value: 'FOREGROUND_SHADOWS_CONTAINER' },
                { label: 'Foreground Effects', value: 'FOREGROUND_EFFECTS_CONTAINER' },
                { label: 'Foreground Front', value: 'FOREGROUND_FRONT_CONTAINER' },
              ],
              dependsOn: []
            }],
            effects: [
              {
                dependsOn: [
                  {
                    inputField: 'pluginMetadata[].containerType',
                    operator: '=',
                    inputValue: 'BACKGROUND_BEHIND_CONTAINER'
                  }
                ],
                outputField: 'name',
                outputValue: 'Background Behind'
              },
              {
                dependsOn: [
                  {
                    inputField: 'pluginMetadata[].containerType',
                    operator: '=',
                    inputValue: 'BACKGROUND_STRUCTURES_CONTAINER'
                  }
                ],
                outputField: 'name',
                outputValue: 'Background Structures'
              },
              {
                dependsOn: [
                  {
                    inputField: 'pluginMetadata[].containerType',
                    operator: '=',
                    inputValue: 'BACKGROUND_SHADOWS_CONTAINER'
                  }
                ],
                outputField: 'name',
                outputValue: 'Background Shadows'
              },
              {
                dependsOn: [
                  {
                    inputField: 'pluginMetadata[].containerType',
                    operator: '=',
                    inputValue: 'BACKGROUND_EFFECTS_CONTAINER'
                  }
                ],
                outputField: 'name',
                outputValue: 'Background Effects'
              },
              {
                dependsOn: [
                  {
                    inputField: 'pluginMetadata[].containerType',
                    operator: '=',
                    inputValue: 'CHARACTERS_BACK_CONTAINER'
                  }
                ],
                outputField: 'name',
                outputValue: 'Characters Back'
              },
              {
                dependsOn: [
                  {
                    inputField: 'pluginMetadata[].containerType',
                    operator: '=',
                    inputValue: 'CHARACTERS_CONTAINER'
                  }
                ],
                outputField: 'name',
                outputValue: 'Characters Container'
              },
              {
                dependsOn: [
                  {
                    inputField: 'pluginMetadata[].containerType',
                    operator: '=',
                    inputValue: 'CHARACTERS_FRONT_CONTAINER'
                  }
                ],
                outputField: 'name',
                outputValue: 'Characters Front'
              },
              {
                dependsOn: [
                  {
                    inputField: 'pluginMetadata[].containerType',
                    operator: '=',
                    inputValue: 'FOREGROUND_STRUCTURES_CONTAINER'
                  }
                ],
                outputField: 'name',
                outputValue: 'Foreground Structures'
              },
              {
                dependsOn: [
                  {
                    inputField: 'pluginMetadata[].containerType',
                    operator: '=',
                    inputValue: 'FOREGROUND_SHADOWS_CONTAINER'
                  }
                ],
                outputField: 'name',
                outputValue: 'Foreground Shadows'
              },
              {
                dependsOn: [
                  {
                    inputField: 'pluginMetadata[].containerType',
                    operator: '=',
                    inputValue: 'FOREGROUND_EFFECTS_CONTAINER'
                  }
                ],
                outputField: 'name',
                outputValue: 'Foreground Effects'
              },
              {
                dependsOn: [
                  {
                    inputField: 'pluginMetadata[].containerType',
                    operator: '=',
                    inputValue: 'FOREGROUND_FRONT_CONTAINER'
                  }
                ],
                outputField: 'name',
                outputValue: 'Foreground Front'
              }
            ]
          }
        );
      }
      
      if (this.props.assetMetadata.pluginMetadata['com.fraymakers.FraymakersMetadata'].objectType === 'RECT_COLLISION_AREA') {
        // Rect collision area metadata
        definitions.push(
          {
            metadataOwnerTypes: ['COLLISION_BOX_LAYER_METADATA'],
            fields: [{
              name: 'collisionBoxType',
              label: 'Collision Box Type',
              type: 'DROPDOWN',
              defaultValue: 'NONE',
              options: [
                { label: 'None', value: 'NONE' },
                ...this.getRectCollisionAreaDropdownOptions()
              ],
              dependsOn: []
            }],
            effects: [
              ...this.getRectCollisionAreaEffects()
            ]
          }
        );
      }
      
      if (this.props.assetMetadata.pluginMetadata['com.fraymakers.FraymakersMetadata'].objectType === 'RECT_STRUCTURE') {
        // Rect structure metadata
        definitions.push(
          {
            metadataOwnerTypes: ['COLLISION_BOX_LAYER_METADATA'],
            fields: [{
              name: 'collisionBoxType',
              label: 'Collision Box Type',
              type: 'DROPDOWN',
              defaultValue: 'NONE',
              options: [
                { label: 'None', value: 'NONE' },
                ...this.getRectStructureDropdownOptions()
              ],
              dependsOn: []
            }],
            effects: [
              ...this.getRectStructureEffects()
            ]
          },
          ...this.getCollisionBoxSymbolStructureMetadataDefinitions(),
        );
      }
      
      if (this.props.assetMetadata.pluginMetadata['com.fraymakers.FraymakersMetadata'].objectType === 'LINE_SEGMENT_STRUCTURE') {
        // Line segment metadata
        definitions.push(
          {
            metadataOwnerTypes: ['LINE_SEGMENT_LAYER_METADATA'],
            fields: [
              {
                name: 'lineSegmentType',
                label: 'Line Segment Type',
                type: 'DROPDOWN',
                defaultValue: 'NONE',
                options: [
                  { label: 'None', value: 'NONE' },
                  ...this.getLineSegmentStructureDropdownOptions()
                ],
                dependsOn: []
              }
            ],
            effects: []
          },
          ...this.getLineSegmentSymbolStructureMetadataDefinitions()
        );
      }
    }
    FrayToolsPluginCore.sendMetadataDefinitions(definitions);
  }
  getCollisionBoxSymbolStructureMetadataDefinitions():IMetadataDefinition[] {
    return [
      {
        metadataOwnerTypes: ['COLLISION_BOX_SYMBOL_METADATA'],
        fields: [
          {
            name: 'leftLedge',
            label: 'Left Ledge',
            type: 'BOOLEAN',
            defaultValue: true,
            dependsOn: [
              {
                inputField: 'parent.parent.pluginMetadata[].collisionBoxType',
                operator: '=',
                inputValue: 'RECT_STRUCTURE'
              }
            ]
          },{
            name: 'rightLedge',
            label: 'Right Ledge',
            type: 'BOOLEAN',
            defaultValue: true,
            dependsOn: [
              {
                inputField: 'parent.parent.pluginMetadata[].collisionBoxType',
                operator: '=',
                inputValue: 'RECT_STRUCTURE'
              }
            ]
          }
        ],
        effects: []
      }
    ];
  }
  getLineSegmentSymbolStructureMetadataDefinitions():IMetadataDefinition[] {
    return [
      {
        metadataOwnerTypes: ['LINE_SEGMENT_SYMBOL_METADATA'],
        fields: [{
          name: 'structureType',
          label: 'Structure Type',
          type: 'DROPDOWN',
          defaultValue: 'NONE',
          options: [
            { label: 'None', value: 'NONE' },
            { label: 'Floor', value: 'FLOOR' },
            { label: 'Left Wall', value: 'LEFT_WALL' },
            { label: 'Right Wall', value: 'RIGHT_WALL' },
            { label: 'Ceiling', value: 'CEILING' }
          ],
          dependsOn: [
            {
              inputField: 'parent.parent.pluginMetadata[].lineSegmentType',
              operator: '=',
              inputValue: 'LINE_SEGMENT_STRUCTURE'
            }
          ]
        },{
          name: 'dropThrough',
          label: 'Drop Through',
          type: 'BOOLEAN',
          defaultValue: false,
          dependsOn: [
            {
              inputField: 'parent.parent.pluginMetadata[].lineSegmentType',
              operator: '=',
              inputValue: 'LINE_SEGMENT_STRUCTURE'
            },
            {
              inputField: 'pluginMetadata[].structureType',
              operator: '=',
              inputValue: 'FLOOR'
            }
          ]
        },{
          name: 'leftLedge',
          label: 'Left Ledge',
          type: 'BOOLEAN',
          defaultValue: true,
          dependsOn: [
            {
              inputField: 'parent.parent.pluginMetadata[].lineSegmentType',
              operator: '=',
              inputValue: 'LINE_SEGMENT_STRUCTURE'
            },
            {
              inputField: 'pluginMetadata[].structureType',
              operator: '=',
              inputValue: 'FLOOR'
            }
          ]
        },{
          name: 'rightLedge',
          label: 'Right Ledge',
          type: 'BOOLEAN',
          defaultValue: true,
          dependsOn: [
            {
              inputField: 'parent.parent.pluginMetadata[].lineSegmentType',
              operator: '=',
              inputValue: 'LINE_SEGMENT_STRUCTURE'
            },
            {
              inputField: 'pluginMetadata[].structureType',
              operator: '=',
              inputValue: 'FLOOR'
            }
          ]
        }],
        effects: [
          {
            dependsOn: [
              {
                inputField: 'parent.parent.pluginMetadata[].lineSegmentType',
                operator: '=',
                inputValue: 'LINE_SEGMENT_STRUCTURE'
              },
              {
                inputField: 'pluginMetadata[].structureType',
                operator: '=',
                inputValue: 'FLOOR'
              }
            ],
            outputField: 'color',
            outputValue: '0xeeeeee'
          },
          {
            dependsOn: [
              {
                inputField: 'parent.parent.pluginMetadata[].lineSegmentType',
                operator: '=',
                inputValue: 'LINE_SEGMENT_STRUCTURE'
              },
              {
                inputField: 'pluginMetadata[].structureType',
                operator: '=',
                inputValue: 'FLOOR'
              },
              {
                inputField: 'pluginMetadata[].dropThrough',
                operator: '=',
                inputValue: true
              }
            ],
            outputField: 'color',
            outputValue: '0x0000ff'
          },
          {
            dependsOn: [
              {
                inputField: 'parent.parent.pluginMetadata[].lineSegmentType',
                operator: '=',
                inputValue: 'LINE_SEGMENT_STRUCTURE'
              },
              {
                inputField: 'pluginMetadata[].structureType',
                operator: '=',
                inputValue: 'CEILING'
              }
            ],
            outputField: 'color',
            outputValue: '0xf1948a'
          },
          {
            dependsOn: [
              {
                inputField: 'parent.parent.pluginMetadata[].lineSegmentType',
                operator: '=',
                inputValue: 'LINE_SEGMENT_STRUCTURE'
              },
              {
                inputField: 'pluginMetadata[].structureType',
                operator: '=',
                inputValue: 'LEFT_WALL'
              }
            ],
            outputField: 'color',
            outputValue: '0x0099ff'
          },
          {
            dependsOn: [
              {
                inputField: 'parent.parent.pluginMetadata[].lineSegmentType',
                operator: '=',
                inputValue: 'LINE_SEGMENT_STRUCTURE'
              },
              {
                inputField: 'pluginMetadata[].structureType',
                operator: '=',
                inputValue: 'RIGHT_WALL'
              }
            ],
            outputField: 'color',
            outputValue: '0x66bb6a'
          }
        ]
      }
    ];
  }
  getRectCollisionAreaDropdownOptions():IMetadataDefinitionDropdownFieldDataOptions<string>[] {
    return [
      { label: 'Rect Collision Area', value: 'RECT_COLLISION_AREA' }
    ];
  }
  getRectStructureDropdownOptions():IMetadataDefinitionDropdownFieldDataOptions<string>[] {
    return [
      { label: 'Rect Structure', value: 'RECT_STRUCTURE' }
    ];
  }
  getLineSegmentStructureDropdownOptions():IMetadataDefinitionDropdownFieldDataOptions<string>[] {
    return [
      { label: 'Line Segment Structure', value: 'LINE_SEGMENT_STRUCTURE' }
    ];
  }
  getRectCollisionAreaEffects():IMetadataDefinitionEffect[] {
    return [
      {
        dependsOn: [
          {
            inputField: 'pluginMetadata[].collisionBoxType',
            operator: '=',
            inputValue: 'RECT_COLLISION_AREA'
          }
        ],
        outputField: 'defaultAlpha',
        outputValue: 0.5
      },
      {
        dependsOn: [
          {
            inputField: 'pluginMetadata[].collisionBoxType',
            operator: '=',
            inputValue: 'RECT_COLLISION_AREA'
          }
        ],
        outputField: 'defaultColor',
        outputValue: '0xff8585'
      }
    ];
  }
  getRectStructureEffects():IMetadataDefinitionEffect[] {
    return [
      {
        dependsOn: [
          {
            inputField: 'pluginMetadata[].collisionBoxType',
            operator: '=',
            inputValue: 'RECT_STRUCTURE'
          }
        ],
        outputField: 'defaultAlpha',
        outputValue: 0.5
      },
      {
        dependsOn: [
          {
            inputField: 'pluginMetadata[].collisionBoxType',
            operator: '=',
            inputValue: 'RECT_STRUCTURE'
          }
        ],
        outputField: 'defaultColor',
        outputValue: '0x00ff00'
      }
    ];
  }
  /**
   * Creates a drop down of Collision Body Layer Presets in the Collision Body Layer properties panel
   * @param options
   * @returns 
   */
  getCollisionBodyLayerPresetOptions(options:IMetadataDefinitionDropdownFieldData['options']) {
    _.each(this.state.collisionBodyLayerPresets, (preset) => {
      options.push({
        label: preset.name,
        value: preset.id
      });
    });

    return options;
  }
  /**
   * Given all of the Collision Body Layer Presets defined by the user, generates the corresponding effects so that the defaults for the layer will be overwritten accordingly when the user chooses a preset.
   * @param effects 
   * @returns 
   */
  getCollisionBodyLayerPresetEffects(effects:IMetadataDefinitionEffect[]) {
    _.each(this.state.collisionBodyLayerPresets, (preset) => {
      effects = [...effects, ...this.getEffectsFromCollisionBodyLayerPreset(preset) ];
    });
    return effects;
  }
  /**
   * Helper method for getCollisionBodyLayerPresetEffects() which creates an effect for every relevant defaults field on the Collision Body Layer.
   * @param preset 
   * @returns 
   */
  getEffectsFromCollisionBodyLayerPreset(preset:CollisionBodyLayerPreset):IMetadataDefinitionEffect[] {
    let effects:IMetadataDefinitionEffect[] = [];
    let dependsOn:IMetadataDefinitionConditional[] = [{
      inputField: 'pluginMetadata[].collisionBodyLayerPresets',
      operator: '=',
      inputValue: preset.id
    }];
    effects.push({ dependsOn: dependsOn, outputField: 'defaultHead', outputValue: preset.head });
    effects.push({ dependsOn: dependsOn, outputField: 'defaultFoot', outputValue: preset.foot });
    effects.push({ dependsOn: dependsOn, outputField: 'defaultHipWidth', outputValue: preset.hipWidth });
    effects.push({ dependsOn: dependsOn, outputField: 'defaultHipXOffset', outputValue: preset.hipXOffset });
    effects.push({ dependsOn: dependsOn, outputField: 'defaultHipYOffset', outputValue: preset.hipYOffset });
    
    return effects;
  }
  getCollisionBoxLayerPresetFor(collisonBoxType:string):IMetadataDefinitionEffect[] {
    return [
      {
        dependsOn: [
          {
            inputField: 'pluginMetadata[].collisionBoxType',
            operator: '=',
            inputValue: collisonBoxType
          }
        ],
        outputField: 'defaultAlpha',
        outputValue: this.getCollisionBoxLayerPresetValues(collisonBoxType).alpha
      },
      {
        dependsOn: [
          {
            inputField: 'pluginMetadata[].collisionBoxType',
            operator: '=',
            inputValue: collisonBoxType
          }
        ],
        outputField: 'defaultColor',
        outputValue: this.getCollisionBoxLayerPresetValues(collisonBoxType).color
      }
    ];
  }
  getCollisionBoxLayerPresetValues(collisonBoxType:string) {
    let preset = this.props.configMetadata.activeCollisionBoxLayerPreset ? _.find(this.props.configMetadata.collisionBoxLayerPresets, (preset) => preset.id === this.props.configMetadata.activeCollisionBoxLayerPreset) || CollisionBoxLayerPresetsEditor.getDefaults() : CollisionBoxLayerPresetsEditor.getDefaults();
    return {
      color: preset[`${BOX_TYPES_MAP[collisonBoxType]}Color`].replace(/^#/g, '0x'),
      alpha: preset[`${BOX_TYPES_MAP[collisonBoxType]}Alpha`]
    };
  }
  onAssetMetadataMigrationRequest() {
    let localPluginMetadata = this.props.assetMetadata.pluginMetadata[MANIFEST_JSON.id] || {};
    let otherFieldsToUpdate:any = {};
    
    if (!localPluginMetadata.version) {
      // Inject the version as a metadata field
      localPluginMetadata.version = MANIFEST_JSON.version;
    } else if (localPluginMetadata.version === MANIFEST_JSON.version) {
      // No migrations required, pass null
      FrayToolsPluginCore.sendAssetMetadataMigrations(null);
      
      return;
    }

    if (semverCompare(localPluginMetadata.version, '0.0.1') >= 0 && semverCompare(localPluginMetadata.version, '0.0.6') <= 0) {
      // Clean up legacy spriteType field
      delete localPluginMetadata.spriteType;

      // Remove objectType from symbol layers
      if (_.has(this.props.assetMetadata, 'symbols')) {
        let spriteEntityMetadata = this.props.assetMetadata as ISpriteEntityAssetMetadata;
        _.each(spriteEntityMetadata.symbols, (symbol) => {
          // If this symbol has an objectType field
          if (symbol.pluginMetadata && symbol.pluginMetadata[MANIFEST_JSON.id] && symbol.pluginMetadata[MANIFEST_JSON.id].objectType) {
            // Clone symbol
            let symbolClone = _.cloneDeep(symbol);

            // Delete objectType from the object
            delete symbolClone.pluginMetadata[MANIFEST_JSON.id].objectType;

            // Mark object for updating
            otherFieldsToUpdate.symbols = otherFieldsToUpdate.symbols || [];
            otherFieldsToUpdate.symbols.push(symbolClone);
          }
        });
      }
      
      // Bump version
      localPluginMetadata.version = '0.0.8';
    }
    
    if (semverCompare(localPluginMetadata.version, '0.0.8') >= 0 && semverCompare(localPluginMetadata.version, '0.0.9') <= 0) {
      // Remove index field from all shadow light points
      if (_.has(this.props.assetMetadata, 'layers')) {
        let spriteEntityMetadata = this.props.assetMetadata as ISpriteEntityAssetMetadata;
        _.each(spriteEntityMetadata.layers, (layer) => {
          if (layer.type === 'POINT' && layer.pluginMetadata && layer.pluginMetadata[MANIFEST_JSON.id] && layer.pluginMetadata[MANIFEST_JSON.id].pointType === 'SHADOW_LIGHT_POINT') {
            // Clone layer
            let layerClone = _.cloneDeep(layer);

            // Delete index field
            delete layerClone.pluginMetadata[MANIFEST_JSON.id].index;

            // Mark object for updating
            otherFieldsToUpdate.layers = otherFieldsToUpdate.layers || [];
            otherFieldsToUpdate.layers.push(layerClone);
          }
        });
      }

      // Bump version
      localPluginMetadata.version = '0.0.10';
    }

    if (semverCompare(localPluginMetadata.version, '0.0.10') >= 0 && semverCompare(localPluginMetadata.version, '0.0.13') <= 0) {
      // New container types for layers
      if (_.has(this.props.assetMetadata, 'layers')) {
        let spriteEntityMetadata = this.props.assetMetadata as ISpriteEntityAssetMetadata;
        _.each(spriteEntityMetadata.layers, (layer) => {
          if (layer.type === 'CONTAINER' && layer.pluginMetadata && layer.pluginMetadata[MANIFEST_JSON.id] && layer.pluginMetadata[MANIFEST_JSON.id].containerType === 'BACKGROUND_CONTAINER') {
            // Clone layer
            let layerClone = _.cloneDeep(layer);

            // Rename layer type/name
            layerClone.name = 'Background Effects';
            layerClone.pluginMetadata[MANIFEST_JSON.id].containerType = 'BACKGROUND_EFFECTS_CONTAINER';

            // Mark object for updating
            otherFieldsToUpdate.layers = otherFieldsToUpdate.layers || [];
            otherFieldsToUpdate.layers.push(layerClone);
          } else if (layer.type === 'CONTAINER' && layer.pluginMetadata && layer.pluginMetadata[MANIFEST_JSON.id] && layer.pluginMetadata[MANIFEST_JSON.id].containerType === 'OBJECTS_CONTAINER') {
            // Clone layer
            let layerClone = _.cloneDeep(layer);

            // Rename layer type/name
            layerClone.name = 'Characters';
            layerClone.pluginMetadata[MANIFEST_JSON.id].containerType = 'CHARACTERS_CONTAINER';

            // Mark object for updating
            otherFieldsToUpdate.layers = otherFieldsToUpdate.layers || [];
            otherFieldsToUpdate.layers.push(layerClone);
          } else if (layer.type === 'CONTAINER' && layer.pluginMetadata && layer.pluginMetadata[MANIFEST_JSON.id] && layer.pluginMetadata[MANIFEST_JSON.id].containerType === 'FOREGROUND_CONTAINER') {
            // Clone layer
            let layerClone = _.cloneDeep(layer);

            // Rename layer type/name
            layerClone.name = 'Foreground Effects';
            layerClone.pluginMetadata[MANIFEST_JSON.id].containerType = 'FOREGROUND_EFFECTS_CONTAINER';

            // Mark object for updating
            otherFieldsToUpdate.layers = otherFieldsToUpdate.layers || [];
            otherFieldsToUpdate.layers.push(layerClone);
            console.info(layerClone);
          }
        });
      }

      // Bump version
      localPluginMetadata.version = '0.0.14';
    }
    
    if (semverCompare(localPluginMetadata.version, '0.0.18') <= 0) {
      // Replace shadowLayerIndex with shadowLayerIds for point layers
      if (_.has(this.props.assetMetadata, 'layers')) {
        let spriteEntityMetadata = this.props.assetMetadata as ISpriteEntityAssetMetadata;
        _.each(spriteEntityMetadata.layers, (layer) => {
          // If this point has a shadowLayerIndex field
          if (layer.type === 'POINT' && layer.pluginMetadata && layer.pluginMetadata[MANIFEST_JSON.id] && typeof layer.pluginMetadata[MANIFEST_JSON.id].shadowLayerIndex !== 'undefined') {
            // Clone layer
            let layerClone = _.cloneDeep(layer);

            // Add shadowLayerIds
            layerClone.pluginMetadata[MANIFEST_JSON.id].shadowLayerIds = (layer.pluginMetadata[MANIFEST_JSON.id].shadowLayerIndex >= 0) ? [`${layer.pluginMetadata[MANIFEST_JSON.id].shadowLayerIndex}`] : [];

            // Delete shadowLayerIndex from the object
            delete layerClone.pluginMetadata[MANIFEST_JSON.id].shadowLayerIndex;

            // Mark object for updating
            otherFieldsToUpdate.layers = otherFieldsToUpdate.layers || [];
            otherFieldsToUpdate.layers.push(layerClone);
          }
        });
      }

      // Bump version
      localPluginMetadata.version = '0.0.19';
    }

    if (semverCompare(localPluginMetadata.version, '0.0.21') <= 0) {
      // Replace holdboxes with grabholdpoints
      if (_.has(this.props.assetMetadata, 'layers')) {
        let spriteEntityMetadata = this.props.assetMetadata as ISpriteEntityAssetMetadata;
        let keyframeIdToLayerMap:{[keyframeId:string]: LayerTypes} = {};
        let symbolIdToKeyframeMap:{[symbolId:string]: KeyframeTypes} = {};
        _.each(spriteEntityMetadata.layers, (layer) => {
          // If this is a holdbox layer
          if (layer.type === 'COLLISION_BOX' && /^holdbox\d+/g.test(layer.name)) {
            // Clone layer
            let layerClone = _.cloneDeep(layer);

            // Turn the layer into a Point layer
            layerClone.type = 'POINT' as any;
            layerClone.name = layer.name.replace('holdbox', 'grabholdpoint');

            // Update to proper collision box layer type (only if plugin data actually exists)
            if (layerClone.pluginMetadata && layerClone.pluginMetadata[MANIFEST_JSON.id] && typeof layerClone.pluginMetadata[MANIFEST_JSON.id].collisionBoxType !== 'undefined') {
              delete layerClone.pluginMetadata[MANIFEST_JSON.id].collisionBoxType;
              layerClone.pluginMetadata[MANIFEST_JSON.id].pointType = 'GRAB_HOLD_POINT';
            }

            // Delete extraneous fields
            layerClone.defaultAlpha = undefined;
            layerClone.defaultColor = undefined;

            // Index the keyframe ids
            _.each(layerClone.keyframes, (keyframeId) => {
              keyframeIdToLayerMap[keyframeId] = layerClone;
            });

            // Mark object for updating
            otherFieldsToUpdate.layers = otherFieldsToUpdate.layers || [];
            otherFieldsToUpdate.layers.push(layerClone);
          }
        });
        _.each(spriteEntityMetadata.keyframes, (keyframe) => {
          // If this is a holdbox keyframe
          if (keyframe.type === 'COLLISION_BOX' && keyframeIdToLayerMap[keyframe.$id]) {
            // Clone keyframe
            let keyframeClone = _.cloneDeep(keyframe);

            // Turn the keyframe into a Point keyframe
            keyframeClone.type = 'POINT' as any;

            // Index the symbol id
            symbolIdToKeyframeMap[keyframe.symbol] = keyframeClone;

            // Mark object for updating
            otherFieldsToUpdate.keyframes = otherFieldsToUpdate.keyframes || [];
            otherFieldsToUpdate.keyframes.push(keyframeClone);
          }
        });
        _.each(spriteEntityMetadata.symbols, (symbol) => {
          // If this is a collision box symbol from a holdbox keyframe
          if (symbol.type === 'COLLISION_BOX' && symbolIdToKeyframeMap[symbol.$id]) {
            // Clone symbol
            let symbolClone = _.cloneDeep(symbol);

            // Turn the symbol into a Point symbol
            symbolClone.type = 'POINT' as any;

            // Move the point to the center of the box
            symbolClone.x += symbolClone.scaleX / 2;
            symbolClone.y += symbolClone.scaleY / 2;

            // Delete extraneous fields
            symbolClone.pivotX = undefined;
            symbolClone.pivotY = undefined;
            symbolClone.scaleX = undefined;
            symbolClone.scaleY = undefined;

            // Mark object for updating
            otherFieldsToUpdate.symbols = otherFieldsToUpdate.symbols || [];
            otherFieldsToUpdate.symbols.push(symbolClone);
          }
        });
      }

      // Bump version
      localPluginMetadata.version = '0.0.22';
    }


    // Ensure latest version is applied
    localPluginMetadata.version = MANIFEST_JSON.version;
    
    // Send the migration back to the parent
    FrayToolsPluginCore.sendAssetMetadataMigrations({
      pluginMetadata: {
        ...this.props.assetMetadata.pluginMetadata,
        [MANIFEST_JSON.id]: localPluginMetadata
      },
      ...otherFieldsToUpdate
    } as ILibraryAssetMetadata);
  }

  onCollisionBodyLayerPresetsUpdated(collisionBodyLayerPresets:CollisionBodyLayerPreset[]) {
    // Assign new presets
    let configClone = {...this.props.configMetadata };
    configClone.collisionBodyLayerPresets = collisionBodyLayerPresets;
    FrayToolsPluginCore.configMetadataSync(configClone);
  }

  onCollisionBoxLayerPresetsUpdated(activePreset:string, collisionBoxLayerPresets:CollisionBoxLayerPreset[]) {
    // Assign new presets
    let configClone = {...this.props.configMetadata };
    configClone.activeCollisionBoxLayerPreset = activePreset;
    configClone.collisionBoxLayerPresets = collisionBoxLayerPresets;
    FrayToolsPluginCore.configMetadataSync(configClone);
  }

  public render() {
    if (!this.props.configMode) {
      // No implementation for non-config mode
      return (
        <div className="FraymakersMetadata">
        </div>
      );
    }

    return (
      <div className="FraymakersMetadata container" style={{ textAlign: 'center' }}>
        <h2>Fraymakers Metadata Definitions v{MANIFEST_JSON.version}</h2>
        <div className="container">
          <div className="row">
            <div className="col-sm-12">
              <CollisionBodyLayerPresetsEditor
                collisionBodyLayerPresets={this.props.configMetadata.collisionBodyLayerPresets}
                onUpdated={this.onCollisionBodyLayerPresetsUpdated.bind(this)}
                />
            </div>
          </div>
          <div className="row">
            <div className="col-sm-12">
              <CollisionBoxLayerPresetsEditor
                activePresetId={this.props.configMetadata.activeCollisionBoxLayerPreset}
                collisionBoxLayerPresets={this.props.configMetadata.collisionBoxLayerPresets}
                onUpdated={this.onCollisionBoxLayerPresetsUpdated.bind(this)}
                />
            </div>
          </div>
        </div>
      </div>
    );
  }
}