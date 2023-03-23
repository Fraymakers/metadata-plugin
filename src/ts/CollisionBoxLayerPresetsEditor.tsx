
import * as React from 'react';
import * as _ from 'lodash';
import './CollisionBoxLayerPresetsEditor.scss';
import * as uuid from 'uuid';
import { CollisionBoxLayerPreset } from './types';

interface ICollisionBoxLayerPresetsEditorProps {
  activePresetId:string;
  collisionBoxLayerPresets:CollisionBoxLayerPreset[];
  onUpdated:(activePreset:string, collisionBoxLayerPresets:CollisionBoxLayerPreset[]) => void;
}
interface ICollisionBoxLayerPresetsEditorState {
  activePresetId:string;
  collisionBoxLayerPresets:CollisionBoxLayerPreset[];
}

/** Helper for generating UI */
const BOX_TYPES = [
  'hitbox',
  'hurtbox',
  'grabbox',
  'ledgegrabbox',
  'reflectbox',
  'absorbbox',
  'counterbox',
  'customboxa',
  'customboxb',
  'customboxc',
];

export const BOX_TYPES_MAP = {
  'HIT_BOX': 'hitbox',
  'HURT_BOX': 'hurtbox',
  'GRAB_BOX': 'grabbox',
  'LEDGE_GRAB_BOX': 'ledgegrabbox',
  'REFLECT_BOX': 'reflectbox',
  'ABSORB_BOX': 'absorbbox',
  'COUNTER_BOX': 'counterbox',
  'CUSTOM_BOX_A': 'customboxa',
  'CUSTOM_BOX_B': 'customboxb',
  'CUSTOM_BOX_C': 'customboxc'
};

/**
 * Settings editor for Fraymakers Api Types plugin.
 */
export default class CollisionBoxLayerPresetsEditor extends React.Component<ICollisionBoxLayerPresetsEditorProps, ICollisionBoxLayerPresetsEditorState> {
  presetNameField:React.RefObject<HTMLInputElement>;
  activePresetField:React.RefObject<HTMLSelectElement>;
  constructor(props) {
    super(props);

    this.state = {
      activePresetId: this.props.activePresetId,
      collisionBoxLayerPresets: this.props.collisionBoxLayerPresets || []
    };

    this.presetNameField = React.createRef();
    this.activePresetField = React.createRef();
  }
  public static getDefaults() {
    return {
      hitboxColor: '#ff0000',
      hitboxAlpha: 0.5,
      hurtboxColor: '#f5e042',
      hurtboxAlpha: 0.5,
      grabboxColor: '#ff00ff',
      grabboxAlpha: 0.5,
      ledgegrabboxColor: '#bababa',
      ledgegrabboxAlpha: 0.5,
      reflectboxColor: '#48f748',
      reflectboxAlpha: 0.5,
      absorbboxColor: '#d1d1d1',
      absorbboxAlpha: 0.5,
      counterboxColor: '#42ecff',
      counterboxAlpha: 0.5,
      customboxaColor: '#d1d1d1',
      customboxaAlpha: 0.5,
      customboxbColor: '#d1d1d1',
      customboxbAlpha: 0.5,
      customboxcColor: '#d1d1d1',
      customboxcAlpha: 0.5
    };
  }
  addCollisionBoxLayerPreset(event:React.MouseEvent<HTMLButtonElement>) {
    if (!this.presetNameField.current.value) {
      return;
    }
    this.setState({
      collisionBoxLayerPresets: [...this.state.collisionBoxLayerPresets, {
        id: uuid.v4(),
        name: this.presetNameField.current.value,
        ...CollisionBoxLayerPresetsEditor.getDefaults()
      }]
    }, () => {
      this.presetNameField.current.value = '';
      this.onUpdated();
    });
  }
  onPresetRemoved(presetToRemove:CollisionBoxLayerPreset) {
    this.setState({
      activePresetId: presetToRemove.id === this.state.activePresetId ? null : this.state.activePresetId,
      collisionBoxLayerPresets: _.filter([...this.state.collisionBoxLayerPresets ], (p) => {
        return p.id !== presetToRemove.id;
      })
    }, () => {
      this.onUpdated();
    });
  }
  onUpdated() {
    this.props.onUpdated(this.state.activePresetId, this.state.collisionBoxLayerPresets);
  }
  onPresetEdited(presetToUpdate:CollisionBoxLayerPreset) {
    this.setState({
      collisionBoxLayerPresets: _.map(this.state.collisionBoxLayerPresets, (preset) => {
        if (preset.id === presetToUpdate.id) {
          return presetToUpdate;
        }
        return preset;
      })
    }, () => {
      this.onUpdated();
    });
  }
  onActivePresetChanged(e:React.ChangeEvent<HTMLSelectElement>) {
    this.setState({
      activePresetId: e.currentTarget.value ? e.currentTarget.value : null
    }, () => {
      this.onUpdated();
    });
  }
  
  public render() {
    return (
      <fieldset className="CollisionBoxLayerPresetsEditor">
        <legend>Collision Box Layer Presets</legend>
        <div>
          <label htmlFor="cbpresetactive">Active Preset</label>
          <select ref={this.activePresetField} id="cbpresetactive" defaultValue={this.state.activePresetId || ""} placeholder="None" onChange={this.onActivePresetChanged.bind(this)}>
            <option value="">None</option>
            {_.map(this.state.collisionBoxLayerPresets, (preset, key) => {
              return (
                <option key={`${preset.id}${key}`} value={preset.id}>{preset.name}</option>
              );
            })}
          </select>
        </div>
        <div>
          <label htmlFor="cbpreset">New Preset Name</label>
          <input ref={this.presetNameField} type="text" id="cbpreset" placeholder=""/>
          <button className="primary" onClick={this.addCollisionBoxLayerPreset.bind(this)}>Add</button>
        </div>
        <table>
          <caption>Presets</caption>
          <thead>
            <tr>
              <th>Name</th>
              <th>Values</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {_.map(this.state.collisionBoxLayerPresets, (preset, index) => {
              return (
                <CollisionBoxLayerPresetsEditorListItem
                  key={preset.id}
                  collisionBoxPreset={preset}
                  onSave={this.onPresetEdited.bind(this)}
                  onRemove={this.onPresetRemoved.bind(this)}
                  />
              )
            })}
          </tbody>
        </table>
      </fieldset> 
    );
  }
}


interface ICollisionBoxLayerPresetsEditorListItemProps {
  collisionBoxPreset:CollisionBoxLayerPreset;
  onSave:(preset:CollisionBoxLayerPreset) => void;
  onRemove:(preset:CollisionBoxLayerPreset) => void;
}
interface ICollisionBoxLayerPresetsEditorListItemState {
  collisionBoxPreset?:CollisionBoxLayerPreset;
  editMode?:boolean;
}

/**
 * Settings editor for Fraymakers Api Types plugin.
 */
class CollisionBoxLayerPresetsEditorListItem extends React.Component<ICollisionBoxLayerPresetsEditorListItemProps, ICollisionBoxLayerPresetsEditorListItemState> {
  nameInput:React.RefObject<HTMLInputElement>;
  valueInputs:{[key:string]: { color: React.RefObject<HTMLInputElement>, alpha: React.RefObject<HTMLInputElement> }};

  constructor(props) {
    super(props);

    this.state = {
      collisionBoxPreset: this.props.collisionBoxPreset,
      editMode: false
    };

    this.nameInput = React.createRef();
    this.valueInputs = {};
    _.each(BOX_TYPES, (type) => {
      this.valueInputs[type] = {
        color: React.createRef(),
        alpha:React.createRef()
      }
    });
  }

  onEdit() {
    this.setState({
      editMode: true
    });
  }
  onSave() {
    let valueMap:{[key:string]: string|number} = {};
    _.each(this.valueInputs, (input, key) => {
      valueMap[`${key}Color`] = input.color.current.value;
      valueMap[`${key}Alpha`] = parseFloat(input.alpha.current.value);
    });

    this.setState({
      collisionBoxPreset: {
        id: this.state.collisionBoxPreset.id,
        name: this.nameInput.current.value,
        ...valueMap
      } as any,
      editMode: false
    }, () => {
      this.props.onSave(this.state.collisionBoxPreset);
    });
  }
  onRemove() {
    this.props.onRemove(this.state.collisionBoxPreset);
  }

  public render() {
    return (
      <tr className="CollisionBoxLayerPresetsEditorListItem">
        <td data-label="Name"><input ref={this.nameInput} type="text" defaultValue={this.state.collisionBoxPreset.name} disabled={!this.state.editMode}/></td>
        <td>
          {_.map(BOX_TYPES, (type, key) => {
            return (
              <div key={`${this.props.collisionBoxPreset.id}${key}`} className="row">
                <div className="col-sm-6">
                  {type} color: <input ref={this.valueInputs[type].color} type="color" defaultValue={this.state.collisionBoxPreset[`${type}Color`]} disabled={!this.state.editMode}/>
                </div>
                <div className="col-sm-6">
                  alpha: <input ref={this.valueInputs[type].alpha} type="number" step="0.1" defaultValue={this.state.collisionBoxPreset[`${type}Alpha`]} disabled={!this.state.editMode}/>
                </div>
              </div>
            );
          })}
        </td>
        <td data-label="Action">
          {(() => {
            if (this.state.editMode) {
              return (
                <button className="tertiary small" onClick={this.onSave.bind(this)}>&#10004;</button>
              );
            }
          })()}
          {(() => {
            if (!this.state.editMode) {
              return (
                <>
                  <button className="small" onClick={this.onEdit.bind(this)}><span className="icon-edit"></span></button> 
                  <button className="secondary small" onClick={this.onRemove.bind(this)}>x</button>
                </>
              );
            }
          })()}
        </td>
      </tr>
    );
  }
}

