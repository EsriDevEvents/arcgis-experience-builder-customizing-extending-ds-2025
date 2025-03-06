import { type ImmutableObject } from 'seamless-immutable'

export interface Config {
  sampleCensusCountyData: string
}

export type IMConfig = ImmutableObject<Config>
