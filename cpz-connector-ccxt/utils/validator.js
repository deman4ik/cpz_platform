const Validator = require("fastest-validator");

let v = new Validator();

function chekData(data){
    
    const schema = {   
        asset: "string",
        currency: "string",
        type: "string",
        direction: "string",
        volume: {type: "number", positive: true},
        price: {type: "number", positive: true},
    };
        
    var check = v.compile(schema);

    var reslult = check(data);
    
    return reslult;
}

module.exports = chekData;