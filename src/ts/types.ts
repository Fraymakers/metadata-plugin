import { IPluginConfig } from '@fraytools/plugin-core/lib/types';
import { ILibraryAssetMetadata } from '@fraytools/plugin-core/lib/types/fraytools';

export type CollisionBodyLayerPreset = {
  id: string;
  name:string;
  foot:number;
  head:number;
  hipWidth:number;
  hipXOffset:number;
  hipYOffset:number;
}

export type CollisionBoxLayerPreset = {
  id: string;
  name:string;
  hitboxColor:string;
  hitboxAlpha:number;
  hurtboxColor:string;
  hurtboxAlpha:number;
  grabboxColor:string;
  grabboxAlpha:number;
  ledgegrabboxColor:string;
  ledgegrabboxAlpha:number;
  reflectboxColor:string;
  reflectboxAlpha:number;
  absorbboxColor:string;
  absorbboxAlpha:number;
  counterboxColor:string;
  counterboxAlpha:number;
  customboxaColor:string;
  customboxaAlpha:number;
  customboxbColor:string;
  customboxbAlpha:number;
  customboxcColor:string;
  customboxcAlpha:number;
}

export interface IFraymakersMetadataConfig extends IPluginConfig {
  collisionBodyLayerPresets:CollisionBodyLayerPreset[];
  activeCollisionBoxLayerPreset:string;
  collisionBoxLayerPresets:CollisionBoxLayerPreset[];
}

export type FraymakersObjectType = 'NONE'|'ENTITY'|'CHARACTER'|'PROJECTILE'|'ASSIST'|'CUSTOM_GAME_OBJECT'|'STAGE'|'COLLISION_AREA'|'RECT_COLLISION_AREA'|'RECT_STRUCTURE'|'LINE_SEGMENT_STRUCTURE'|'MATCH_RULES';

export interface IFraymakersMetadataPluginAssetMetadata extends ILibraryAssetMetadata {
  pluginMetadata: {
    'com.fraymakers.FraymakersMetadata'?: {
      objectType:FraymakersObjectType
    }
  }
}
