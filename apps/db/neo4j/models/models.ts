//models.ts
import { USER, SHARENODE, POST } from './modelDefinitions';
import applogger from '../../../../lib/logger/applogger';
import { USERInitializer } from './USERInitializer';
import { SHARENODEInitializer } from './SHARENODEInitializer';
import { POSTInitializer } from './POSTInitializer';
import { USERModel } from './types/nodes/USER';
import { SHARENODEModel } from './types/nodes/SHARENODE';
import { POSTModel } from './types/nodes/POST';

export interface ModelsInterface{
  USER: USERModel
  SHARENODE: SHARENODEModel,
  POST: POSTModel
}

export const models:ModelsInterface = {
    USER,
    SHARENODE,
    POST
  };

USERInitializer.init()
SHARENODEInitializer.init()
POSTInitializer.init()

  
  
