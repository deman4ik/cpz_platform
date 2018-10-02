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
        public static bool CheckData(string type, JObject jObject, out IList<string> errors)
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
                                          'slippageStep': {'type': ['number', 'null']},
                                          'volume': {'type': 'number'}
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
            else if(type == "signal")
            {
                schema = JSchema.Parse(@"{
                'type': 'object',
                'properties': {
                'signalId': {'type':'string'},
                'exchange': {'type': 'string'},
                'asset': {'type': 'string'},
                'currency': {'type': 'string'},
                'robotId': {'type': 'string'},
                'adviserId': {'type': 'string'},
                'alertTime': {'type': 'number'},
                'action': {'type': 'string'},
                'qty': {'type': 'number'},
                'orderType': {'type': 'string'},
                'price': {'type': 'number'},
                'priceSource': {'type': 'string'},
                'positionId': {'type': 'number'},
                'candle': {'type': ['object', 'null'],
                           'properties': {
                                          'time': {'type': 'number'},
                                          'open': {'type': 'number'},
                                          'close': {'type': 'number'},
                                          'high': {'type': 'number'},
                                          'low': {'type': 'number'},
                                          'volume': {'type': 'number'},
                                         }
                            },
                'settings': {'type': ['object', 'null'],
                           'properties': {
                                          'slippageStep': {'type': ['number', 'null']},
                                          'volume': {'type': 'number'}
                                         }
                            }
                }}");
            }
            else if(type == "tick")
            {
                schema = JSchema.Parse(@"{
                'type': 'object',
                'properties': {
                'exchange': {'type': 'string'},
                'asset': {'type': 'string'},
                'currency': {'type': 'string'},
                'price': {'type': 'number'},
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
