/**
 * Bundled by jsDelivr using Rollup v2.79.1 and Terser v5.19.2.
 * Original file: /npm/@google/generative-ai@0.1.3/dist/index.mjs
 *
 * Do NOT use SRI with dynamically generated files! More information: https://www.jsdelivr.com/using-sri-with-dynamic-files
 */
/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var t,e,n,s,o,i;!function(t){t.HARM_CATEGORY_UNSPECIFIED="HARM_CATEGORY_UNSPECIFIED",t.HARM_CATEGORY_HATE_SPEECH="HARM_CATEGORY_HATE_SPEECH",t.HARM_CATEGORY_SEXUALLY_EXPLICIT="HARM_CATEGORY_SEXUALLY_EXPLICIT",t.HARM_CATEGORY_HARASSMENT="HARM_CATEGORY_HARASSMENT",t.HARM_CATEGORY_DANGEROUS_CONTENT="HARM_CATEGORY_DANGEROUS_CONTENT"}(t||(t={})),function(t){t.HARM_BLOCK_THRESHOLD_UNSPECIFIED="HARM_BLOCK_THRESHOLD_UNSPECIFIED",t.BLOCK_LOW_AND_ABOVE="BLOCK_LOW_AND_ABOVE",t.BLOCK_MEDIUM_AND_ABOVE="BLOCK_MEDIUM_AND_ABOVE",t.BLOCK_ONLY_HIGH="BLOCK_ONLY_HIGH",t.BLOCK_NONE="BLOCK_NONE"}(e||(e={})),function(t){t.HARM_PROBABILITY_UNSPECIFIED="HARM_PROBABILITY_UNSPECIFIED",t.NEGLIGIBLE="NEGLIGIBLE",t.LOW="LOW",t.MEDIUM="MEDIUM",t.HIGH="HIGH"}(n||(n={})),function(t){t.BLOCKED_REASON_UNSPECIFIED="BLOCKED_REASON_UNSPECIFIED",t.SAFETY="SAFETY",t.OTHER="OTHER"}(s||(s={})),function(t){t.FINISH_REASON_UNSPECIFIED="FINISH_REASON_UNSPECIFIED",t.STOP="STOP",t.MAX_TOKENS="MAX_TOKENS",t.SAFETY="SAFETY",t.RECITATION="RECITATION",t.OTHER="OTHER"}(o||(o={})),function(t){t.TASK_TYPE_UNSPECIFIED="TASK_TYPE_UNSPECIFIED",t.RETRIEVAL_QUERY="RETRIEVAL_QUERY",t.RETRIEVAL_DOCUMENT="RETRIEVAL_DOCUMENT",t.SEMANTIC_SIMILARITY="SEMANTIC_SIMILARITY",t.CLASSIFICATION="CLASSIFICATION",t.CLUSTERING="CLUSTERING"}(i||(i={}));
/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class r extends Error{constructor(t){super(`[GoogleGenerativeAI Error]: ${t}`)}}class a extends r{constructor(t,e){super(t),this.response=e}}
/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const c="0.1.3",d="genai-js";var u;!function(t){t.GENERATE_CONTENT="generateContent",t.STREAM_GENERATE_CONTENT="streamGenerateContent",t.COUNT_TOKENS="countTokens",t.EMBED_CONTENT="embedContent",t.BATCH_EMBED_CONTENTS="batchEmbedContents"}(u||(u={}));class E{constructor(t,e,n,s){this.model=t,this.task=e,this.apiKey=n,this.stream=s}toString(){let t=`https://generativelanguage.googleapis.com/v1/models/${this.model}:${this.task}`;return this.stream&&(t+="?alt=sse"),t}}async function l(t,e){let n;try{if(n=await fetch(t.toString(),{method:"POST",headers:{"Content-Type":"application/json","x-goog-api-client":`${d}/${c}`,"x-goog-api-key":t.apiKey},body:e}),!n.ok){let t="";try{const e=await n.json();t=e.error.message,e.error.details&&(t+=` ${JSON.stringify(e.error.details)}`)}catch(t){}throw new Error(`[${n.status} ${n.statusText}] ${t}`)}}catch(e){const n=new r(`Error fetching from ${t.toString()}: ${e.message}`);throw n.stack=e.stack,n}return n}
/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function h(t){return t.text=()=>{if(t.candidates&&t.candidates.length>0){if(t.candidates.length>1&&console.warn(`This response had ${t.candidates.length} candidates. Returning text from the first candidate only. Access response.candidates directly to use the other candidates.`),_(t.candidates[0]))throw new a(`${g(t)}`,t);return function(t){var e,n,s,o;return(null===(o=null===(s=null===(n=null===(e=t.candidates)||void 0===e?void 0:e[0].content)||void 0===n?void 0:n.parts)||void 0===s?void 0:s[0])||void 0===o?void 0:o.text)?t.candidates[0].content.parts[0].text:""}(t)}if(t.promptFeedback)throw new a(`Text not available. ${g(t)}`,t);return""},t}const f=[o.RECITATION,o.SAFETY];function _(t){return!!t.finishReason&&f.includes(t.finishReason)}function g(t){var e,n,s;let o="";if(t.candidates&&0!==t.candidates.length||!t.promptFeedback){if(null===(s=t.candidates)||void 0===s?void 0:s[0]){const e=t.candidates[0];_(e)&&(o+=`Candidate was blocked due to ${e.finishReason}`,e.finishMessage&&(o+=`: ${e.finishMessage}`))}}else o+="Response was blocked",(null===(e=t.promptFeedback)||void 0===e?void 0:e.blockReason)&&(o+=` due to ${t.promptFeedback.blockReason}`),(null===(n=t.promptFeedback)||void 0===n?void 0:n.blockReasonMessage)&&(o+=`: ${t.promptFeedback.blockReasonMessage}`);return o}function p(t){return this instanceof p?(this.v=t,this):new p(t)}function T(t,e,n){if(!Symbol.asyncIterator)throw new TypeError("Symbol.asyncIterator is not defined.");var s,o=n.apply(t,e||[]),i=[];return s={},r("next"),r("throw"),r("return"),s[Symbol.asyncIterator]=function(){return this},s;function r(t){o[t]&&(s[t]=function(e){return new Promise((function(n,s){i.push([t,e,n,s])>1||a(t,e)}))})}function a(t,e){try{(n=o[t](e)).value instanceof p?Promise.resolve(n.value.v).then(c,d):u(i[0][2],n)}catch(t){u(i[0][3],t)}var n}function c(t){a("next",t)}function d(t){a("throw",t)}function u(t,e){t(e),i.shift(),i.length&&a(i[0][0],i[0][1])}}"function"==typeof SuppressedError&&SuppressedError;
/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const O=/^data\: (.*)(?:\n\n|\r\r|\r\n\r\n)/;function S(t){const e=function(t){const e=t.getReader();return new ReadableStream({start(t){let n="";return s();function s(){return e.read().then((({value:e,done:o})=>{if(o)return n.trim()?void t.error(new r("Failed to parse stream")):void t.close();n+=e;let i,a=n.match(O);for(;a;){try{i=JSON.parse(a[1])}catch(e){return void t.error(new r(`Error parsing JSON response: "${a[1]}"`))}t.enqueue(i),n=n.substring(a[0].length),a=n.match(O)}return s()}))}}})}(t.body.pipeThrough(new TextDecoderStream("utf8",{fatal:!0}))),[n,s]=e.tee();return{stream:m(n),response:y(s)}}async function y(t){const e=[],n=t.getReader();for(;;){const{done:t,value:s}=await n.read();if(t)return h(C(e));e.push(s)}}function m(t){return T(this,arguments,(function*(){const e=t.getReader();for(;;){const{value:t,done:n}=yield p(e.read());if(n)break;yield yield p(h(t))}}))}function C(t){const e=t[t.length-1],n={promptFeedback:null==e?void 0:e.promptFeedback};for(const e of t)if(e.candidates)for(const t of e.candidates){const e=t.index;if(n.candidates||(n.candidates=[]),n.candidates[e]||(n.candidates[e]={index:t.index}),n.candidates[e].citationMetadata=t.citationMetadata,n.candidates[e].finishReason=t.finishReason,n.candidates[e].finishMessage=t.finishMessage,n.candidates[e].safetyRatings=t.safetyRatings,t.content&&t.content.parts){n.candidates[e].content||(n.candidates[e].content={role:t.content.role||"user",parts:[{text:""}]});for(const s of t.content.parts)s.text&&(n.candidates[e].content.parts[0].text+=s.text)}}return n}
/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function N(t,e,n){const s=new E(e,u.STREAM_GENERATE_CONTENT,t,!0);return S(await l(s,JSON.stringify(n)))}async function A(t,e,n){const s=new E(e,u.GENERATE_CONTENT,t,!1),o=await l(s,JSON.stringify(n));return{response:h(await o.json())}}
/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function R(t,e){let n=[];if("string"==typeof t)n=[{text:t}];else for(const e of t)"string"==typeof e?n.push({text:e}):n.push(e);return{role:e,parts:n}}function I(t){if(t.contents)return t;return{contents:[R(t,"user")]}}
/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const v="SILENT_ERROR";class M{constructor(t,e,n){this.model=e,this.params=n,this._history=[],this._sendPromise=Promise.resolve(),this._apiKey=t,(null==n?void 0:n.history)&&(this._history=n.history.map((t=>{if(!t.role)throw new Error("Missing role for history item: "+JSON.stringify(t));return R(t.parts,t.role)})))}async getHistory(){return await this._sendPromise,this._history}async sendMessage(t){var e,n;await this._sendPromise;const s=R(t,"user"),o={safetySettings:null===(e=this.params)||void 0===e?void 0:e.safetySettings,generationConfig:null===(n=this.params)||void 0===n?void 0:n.generationConfig,contents:[...this._history,s]};let i;return this._sendPromise=this._sendPromise.then((()=>A(this._apiKey,this.model,o))).then((t=>{var e;if(t.response.candidates&&t.response.candidates.length>0){this._history.push(s);const n=Object.assign({parts:[],role:"model"},null===(e=t.response.candidates)||void 0===e?void 0:e[0].content);this._history.push(n)}else{const e=g(t.response);e&&console.warn(`sendMessage() was unsuccessful. ${e}. Inspect response object for details.`)}i=t})),await this._sendPromise,i}async sendMessageStream(t){var e,n;await this._sendPromise;const s=R(t,"user"),o={safetySettings:null===(e=this.params)||void 0===e?void 0:e.safetySettings,generationConfig:null===(n=this.params)||void 0===n?void 0:n.generationConfig,contents:[...this._history,s]},i=N(this._apiKey,this.model,o);return this._sendPromise=this._sendPromise.then((()=>i)).catch((t=>{throw new Error(v)})).then((t=>t.response)).then((t=>{if(t.candidates&&t.candidates.length>0){this._history.push(s);const e=Object.assign({},t.candidates[0].content);e.role||(e.role="model"),this._history.push(e)}else{const e=g(t);e&&console.warn(`sendMessageStream() was unsuccessful. ${e}. Inspect response object for details.`)}})).catch((t=>{t.message!==v&&console.error(t)})),i}}
/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class w{constructor(t,e){var n;this.apiKey=t,e.model.startsWith("models/")?this.model=null===(n=e.model.split("models/"))||void 0===n?void 0:n[1]:this.model=e.model,this.generationConfig=e.generationConfig||{},this.safetySettings=e.safetySettings||[]}async generateContent(t){const e=I(t);return A(this.apiKey,this.model,Object.assign({generationConfig:this.generationConfig,safetySettings:this.safetySettings},e))}async generateContentStream(t){const e=I(t);return N(this.apiKey,this.model,Object.assign({generationConfig:this.generationConfig,safetySettings:this.safetySettings},e))}startChat(t){return new M(this.apiKey,this.model,t)}async countTokens(t){const e=I(t);return async function(t,e,n){const s=new E(e,u.COUNT_TOKENS,t,!1);return(await l(s,JSON.stringify(Object.assign(Object.assign({},n),{model:e})))).json()}
/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */(this.apiKey,this.model,e)}async embedContent(t){const e=function(t){if("string"==typeof t||Array.isArray(t))return{content:R(t,"user")};return t}(t);return async function(t,e,n){const s=new E(e,u.EMBED_CONTENT,t,!1);return(await l(s,JSON.stringify(n))).json()}(this.apiKey,this.model,e)}async batchEmbedContents(t){return async function(t,e,n){const s=new E(e,u.BATCH_EMBED_CONTENTS,t,!1),o=n.requests.map((t=>Object.assign(Object.assign({},t),{model:`models/${e}`})));return(await l(s,JSON.stringify({requests:o}))).json()}(this.apiKey,this.model,t)}}
/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class L{constructor(t){this.apiKey=t}getGenerativeModel(t){if(!t.model)throw new r("Must provide a model name. Example: genai.getGenerativeModel({ model: 'my-model-name' })");return new w(this.apiKey,t)}}export{s as BlockReason,M as ChatSession,o as FinishReason,w as GenerativeModel,L as GoogleGenerativeAI,e as HarmBlockThreshold,t as HarmCategory,n as HarmProbability,i as TaskType};export default null;
//# sourceMappingURL=/sm/9fb984a0648229b59241835ffe335c82c54d91d7e12f385b2ae873745a4b6ac5.map