
import * as React from 'react';
import * as _ from 'lodash';
import './CollisionBodyLayerPresetsEditor.scss';
import * as uuid from 'uuid';
import { CollisionBodyLayerPreset } from './types';

interface ICollisionBodyLayerPresetsEditorProps {
  collisionBodyLayerPresets:CollisionBodyLayerPreset[];
  onUpdated:(collisionBodyLayerPresets:CollisionBodyLayerPreset[]) => void;
}
interface ICollisionBodyLayerPresetsEditorState {
  collisionBodyLayerPresets:CollisionBodyLayerPreset[];
}

/**
 * Settings editor for Fraymakers Api Types plugin.
 */
export default class CollisionBodyLayerPresetsEditor extends React.Component<ICollisionBodyLayerPresetsEditorProps, ICollisionBodyLayerPresetsEditorState> {
  presetNameField:React.RefObject<HTMLInputElement>;
  constructor(props) {
    super(props);

    this.state = {
      collisionBodyLayerPresets: this.props.collisionBodyLayerPresets || []
    };

    this.presetNameField = React.createRef();
  }

  addCollisionBodyLayerPreset(event:React.MouseEvent<HTMLButtonElement>) {
    if (!this.presetNameField.current.value) {
      return;
    }
    this.setState({
      collisionBodyLayerPresets: [...this.state.collisionBodyLayerPresets, {
        id: uuid.v4(),
        name: this.presetNameField.current.value,
        foot: 0,
        head: 100,
        hipWidth: 50,
        hipXOffset: 0,
        hipYOffset: 0
      }]
    }, () => {
      this.presetNameField.current.value = '';
      this.onUpdated();
    });
  }
  onPresetRemoved(presetToRemove:CollisionBodyLayerPreset) {
    this.setState({
      collisionBodyLayerPresets: _.filter([...this.state.collisionBodyLayerPresets ], (p) => {
        return p.id !== presetToRemove.id;
      })
    }, () => {
      this.onUpdated();
    });
  }
  onUpdated() {
    this.props.onUpdated(this.state.collisionBodyLayerPresets);
  }
  onPresetEdited(presetToUpdate:CollisionBodyLayerPreset) {
    this.setState({
      collisionBodyLayerPresets: _.map(this.state.collisionBodyLayerPresets, (preset) => {
        if (preset.id === presetToUpdate.id) {
          return presetToUpdate;
        }
        return preset;
      })
    }, () => {
      this.onUpdated();
    });
  }
  
  public render() {
    return (
      <fieldset className="CollisionBodyLayerPresetsEditor">
        <legend>ECB Layer Presets</legend>
        <label htmlFor="ecbpreset">New Preset Name</label>
        <input ref={this.presetNameField} type="text" id="ecbpreset" placeholder=""/>
        <button className="primary" onClick={this.addCollisionBodyLayerPreset.bind(this)}>Add</button>
        <table>
          <caption>Presets</caption>
          <thead>
            <tr>
              <th>Name</th>
              <th>Foot</th>
              <th>Head</th>
              <th>Hip Width</th>
              <th>Hip X</th>
              <th>Hip Y</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {_.map(this.state.collisionBodyLayerPresets, (preset, index) => {
              return (
                <CollisionBodyLayerPresetsEditorListItem
                  key={preset.id}
                  collisionBodyPreset={preset}
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


interface ICollisionBodyLayerPresetsEditorListItemProps {
  collisionBodyPreset:CollisionBodyLayerPreset;
  onSave:(preset:CollisionBodyLayerPreset) => void;
  onRemove:(preset:CollisionBodyLayerPreset) => void;
}
interface ICollisionBodyLayerPresetsEditorListItemState {
  collisionBodyPreset?:CollisionBodyLayerPreset;
  editMode?:boolean;
}

/**
 * Settings editor for Fraymakers Api Types plugin.
 */
class CollisionBodyLayerPresetsEditorListItem extends React.Component<ICollisionBodyLayerPresetsEditorListItemProps, ICollisionBodyLayerPresetsEditorListItemState> {
  nameInput:React.RefObject<HTMLInputElement>;
  headInput:React.RefObject<HTMLInputElement>;
  footInput:React.RefObject<HTMLInputElement>;
  hipWidthInput:React.RefObject<HTMLInputElement>;
  hipXInput:React.RefObject<HTMLInputElement>;
  hipYInput:React.RefObject<HTMLInputElement>;

  constructor(props) {
    super(props);

    this.state = {
      collisionBodyPreset: this.props.collisionBodyPreset,
      editMode: false
    };

    this.nameInput = React.createRef();
    this.headInput = React.createRef();
    this.footInput = React.createRef();
    this.hipWidthInput = React.createRef();
    this.hipXInput = React.createRef();
    this.hipYInput = React.createRef();
  }

  onEdit() {
    this.setState({
      editMode: true
    });
  }
  onSave() {
    this.setState({
      collisionBodyPreset: {
        id: this.state.collisionBodyPreset.id,
        name: this.nameInput.current.value,
        foot: parseFloat(this.footInput.current.value),
        head: parseFloat(this.headInput.current.value),
        hipWidth: parseFloat(this.hipWidthInput.current.value),
        hipXOffset: parseFloat(this.hipXInput.current.value),
        hipYOffset: parseFloat(this.hipYInput.current.value)
      },
      editMode: false
    }, () => {
      this.props.onSave(this.state.collisionBodyPreset);
    });
  }
  onRemove() {
    this.props.onRemove(this.state.collisionBodyPreset);
  }

  public render() {
    return (
      <tr className="CollisionBodyLayerPresetsEditorListItem">
        <td data-label="Name"><input ref={this.nameInput} type="text" defaultValue={this.state.collisionBodyPreset.name} disabled={!this.state.editMode}/></td>
        <td data-label="Foot"><input ref={this.footInput} type="number" step="any" defaultValue={this.state.collisionBodyPreset.foot} disabled={!this.state.editMode}/></td>
        <td data-label="Head"><input ref={this.headInput} type="number" step="any" defaultValue={this.state.collisionBodyPreset.head} disabled={!this.state.editMode}/></td>
        <td data-label="Hip Width"><input ref={this.hipWidthInput} type="number" step="any" defaultValue={this.state.collisionBodyPreset.hipWidth} disabled={!this.state.editMode}/></td>
        <td data-label="Hip X"><input ref={this.hipXInput} type="number" step="any" defaultValue={this.state.collisionBodyPreset.hipXOffset} disabled={!this.state.editMode}/></td>
        <td data-label="Hip Y"><input ref={this.hipYInput} type="number" step="any" defaultValue={this.state.collisionBodyPreset.hipYOffset} disabled={!this.state.editMode}/></td>
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

