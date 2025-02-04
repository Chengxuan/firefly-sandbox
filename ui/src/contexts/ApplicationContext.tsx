// Copyright © 2022 Kaleido, Inc.
//
// SPDX-License-Identifier: Apache-2.0
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { createContext, Dispatch, SetStateAction } from 'react';
import { IApiStatus, ISelfIdentity } from '../interfaces/api';
import { ITutorialSection } from '../interfaces/tutorialSection';

export interface IApplicationContext {
  selfIdentity: ISelfIdentity | undefined;
  // Json Payload
  jsonPayload: object;
  setJsonPayload: Dispatch<SetStateAction<object>>;
  payloadMissingFields: boolean;
  setPayloadMissingFields: Dispatch<SetStateAction<boolean>>;
  // API Response
  apiResponse: object;
  setApiResponse: Dispatch<SetStateAction<object>>;
  // API Status
  apiStatus: IApiStatus | undefined;
  setApiStatus: Dispatch<SetStateAction<IApiStatus | undefined>>;
  // Plugins
  tokensDisabled: boolean;
  blockchainPlugin: string;
  multiparty: boolean;
  tutorialSections: ITutorialSection[];
  namespace: string;
}

export const ApplicationContext = createContext({} as IApplicationContext);
