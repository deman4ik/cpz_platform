using Newtonsoft.Json.Linq;
using Newtonsoft.Json.Schema;
using System.Collections.Generic;

namespace CpzTrader.Services
{
    public static class Validator
    {
        /// <summary>
        /// проверить данные управления клиентами 
        /// </summary>
        public static bool CheckDataForClientManager(string type, JObject jObject, out IList<string> errors)
        {
            JSchema schema = null;

            if (type == "start")
            {
                schema = JSchema.Parse(@"{
                'type': 'object',
                'properties': {
                'taskId': {'type':'string'},
                'mode': {'type': 'string'},
                'debug': {'type': 'boolean'},
                'exchange': {'type': 'string'},
                'asset': {'type': 'string'},
                'currency': {'type': 'string'},
                'timeframe': {'type': 'integer'},
                'robotId': {'type': 'string'},
                'userId': {'type': 'string'},
                'settings': {'type': ['object', 'null'],
                           'properties': {
                                          'slippageStep': {'type': ['integer', 'null']},
                                          'volume': {'type': 'integer'}
                                         }
                            }
                }}");
            }
            else if(type == "stop")
            {
                schema = JSchema.Parse(@"{
                'type': 'object',
                'properties': {
                'taskId': {'type':'string'}
                }}");
            }
            else if (type == "update")
            {
                schema = JSchema.Parse(@"{
                'type': 'object',
                'properties': {
                'taskId': {'type':'string'},                
                'debug': {'type': 'boolean'},                
                'settings': {'type': ['object', 'null'],
                           'properties': {
                                          'slippageStep': {'type': ['integer', 'null']},
                                          'volume': {'type': 'integer'}
                                         }
                            }
                }}");
            }

            IList<string> errorMessages;

            // проверяем данные на валидность
            bool valid = jObject.IsValid(schema, out errorMessages);

            errors = errorMessages;

            return valid;
        }
    }
}
