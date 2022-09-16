const path = require('path');
const fs = require('fs');
const Validité = {
    valid : true,
    invalid : false,
}
module.exports =
    class MathsController extends require('./Controller') {
        constructor(HttpContext) {
            super(HttpContext);
            this.params = this.HttpContext.path.params;
            // this.valid = true;
            // this.invalid = false;
        }

        // cannot set headers after they are sent to the client
        // this.HttpContext.response deja utiliser
        error(message){
            this.HttpContext.path.params.error = message;
            this.HttpContext.response.JSON(this.HttpContext.path.params);
        }
        
        convertNumberParamsToFloat(name){
            let n  = this.params[name];
            let value = parseFloat(n);
            if(!isNaN(value)){ 
                this.params[name] = value;
                return Validité.valid;
            }
            else{ 
                this.error(`${name} is not a valid number`);
                return Validité.invalid;
            }
        }

        isPositiveNumber(name){
            if(this.params[name] > 0 && !isNaN(this.params[name])){
                Validité.valid;
            }
            return Validité.invalid;
        }

        /**
         * checks if there are extra parameters
         * @param { Array } nbParams 
         */
        checkParamsCount(nbParams){
            if(nbParams.includes("x") && nbParams.includes("y") && Object.keys(this.params).length != 3) { 
                this.error("invalid number of parameters"); 
                return Validité.invalid;
            }
            else if(nbParams.includes("n") && Object.keys(this.params).length != 2) {
                this.error("invalid number of parameters");
                return Validité.invalid;
            } 
            return Validité.valid;
        }
        
        getBinaryParams(){
            if(this.checkParamsCount(["x","y"])){
                if (this.convertNumberParamsToFloat("y")){
                    if(this.convertNumberParamsToFloat("x")){
                        return Validité.valid;
                    }
                };
            }
            return Validité.invalid;
            
        }
        
        getUnaryParams(){
            if(this.checkParamsCount(["n"])){
                if(this.convertNumberParamsToFloat("n")){
                    return Validité.valid;
                }
            }
            return Validité.invalid;
        }
        

        

        help(){
            let helpPagesPath = path.join(process.cwd(), "wwwroot/helpPages/mathsServiceHelp.html");
            let content = fs.readFileSync(helpPagesPath);
            this.HttpContext.response.content("text/html", content);
        }

        result(value){
            this.params.value = value;
            this.HttpContext.response.JSON(this.params);
        }
        
        addition(x,y){
            let result = x + y;
            this.params.op = "+";
            this.result(result);
        }

        soustraction(x,y){
            let result = x - y;
            this.result(result);
        }

        multiplication(x,y){
            let result = x * y;
            this.result(result);
        }

        division(x,y){
            if (y == 0){
                this.error("divison by zero");
            }
            else{
                let result = x / y;
                this.result(result);
            }
        }

        modulo(x,y){
            if(y == 0){
                this.error("can't modulo by 0");
            }else{
                let result = x % y;
                this.result(result);
            }
        }

        factorial(n){
            if(n===0||n===1){
              return 1;
            }
            return n*this.factorial(n-1);
        }
        
        isPrime(value) {
            for(var i = 2; i < value; i++) {
                if(value % i === 0) {
                   return false;
                }
            }
            return value > 1;
        }
        
        findPrime(n){
            let primeNumer = 0;
            for ( let i=0; i < n; i++){
                primeNumer++;
                while (!this.isPrime(primeNumer)){
                    primeNumer++;
                }
            }
            this.result(primeNumer);
        }

        get() {
            if(this.HttpContext.path.queryString == '?'){
                this.help();
            }else{

                if(this.params.op){
                    let operation = this.params.op;

                    switch(operation) {
                        case ' ':
                            if(this.getBinaryParams()){
                                this.addition(this.params.x, this.params.y);
                            };
                            break;
                        case '-':
                            if(this.getBinaryParams()){
                                this.soustraction(this.params.x, this.params.y);
                            }
                            break;
                        case '*':
                            if(this.getBinaryParams()){
                                this.multiplication(this.params.x, this.params.y);
                            }
                            break;
                        case '/':
                            if(this.getBinaryParams()){
                                this.division(this.params.x, this.params.y);
                            }
                            break;
                        case '%':
                            if(this.getBinaryParams()){
                                this.modulo(this.params.x, this.params.y);
                            }
                            break;
                        case 'p':
                            if(this.getUnaryParams()){
                                this.result(this.isPrime(this.params.n));
                            }
                            break;
                        case 'np':
                            if(this.getUnaryParams()){
                                this.findPrime(this.params.n);
                            }
                            break;
                        case '!':
                            if(this.getUnaryParams()){
                                this.result(this.factorial(this.params.n));
                            }
                            break;
                        default:
                            this.error("this opperation is not valide")

                    }

                }else{
                    this.params.error = "parameter 'op' is missing";
                    this.HttpContext.response.JSON(this.HttpContext.path.params);
                }
            }
        }
    }