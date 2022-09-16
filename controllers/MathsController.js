const path = require('path');
const fs = require('fs');
const MathUtilities = require('../MathUtilities');

module.exports =
    class MathsController extends require('./Controller') {
        constructor(HttpContext) {
            super(HttpContext);
            this.params = this.HttpContext.path.params;
        }

        // cannot set headers after they are sent to the client
        // this.HttpContext.response deja utiliser
        error(message){
            this.HttpContext.path.params.error = message;
            this.HttpContext.response.JSON(this.HttpContext.path.params);
        }
        
        convertNumberParamsToFloat(name){
            if(name in this.params){
                let value = parseFloat(this.params[name]);
                if(isNaN(value)){ 
                    this.error(`${name} is not a valid number`);
                    return false;
                }
                this.params[name] = value;
                    return true;
            }else 
                return this.error(name + "parameter missing")
        }

        isPositiveInteger(name, value) {
            if (!(Number.isInteger(value) && (value > 0))) {
                return this.error(name + " parameter must be an integer > 0");
            }
            return true;
        }

        checkParamsCount(nbParams){
            if(Object.keys(this.params).length != nbParams) { 
                this.error("invalid number of parameters"); 
                return false;
            }
            // else if(nbParams.includes("n") && Object.keys(this.params).length != 2) {
            //     this.error("invalid number of parameters");
            //     return false;
            // } 
            return true;
        }
        
        getBinaryParams(){
            return (
                this.checkParamsCount(3) && 
                this.convertNumberParamsToFloat("y") && 
                this.convertNumberParamsToFloat("x")
            );
        }
        
        getUnaryParams(){
            if(this.checkParamsCount(2)){
                if(this.convertNumberParamsToFloat("n")){
                    return true;
                }
            }
            return false;
        }
        
        help(){
            let helpPagesPath = path.join(process.cwd(), wwwroot,"helpPages/mathsServiceHelp.html");
            this.HttpContext.response.HTML(fs.readFileSync(helpPagesPath));
        }

        result(value){
            this.params.value = value;
            this.HttpContext.response.JSON(this.params);
        }
        
        // addition(x,y){
        //     let result = x + y;
        //     this.params.op = "+";
        //     this.result(result);
        // }

        // soustraction(x,y){
        //     let result = x - y;
        //     this.result(result);
        // }

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

        doOperation(){
            if(this.params.op){
                let operation = this.params.op;

                switch(operation) {
                    case ' ':
                        if(this.getBinaryParams())
                            this.result(this.params.x + this.params.y);
                        break;
                    case '-':
                        if(this.getBinaryParams())
                            this.result(this.params.x - this.params.y);
                        break;
                    case '*':
                        if(this.getBinaryParams())
                            this.result(this.params.x * this.params.y);
                        break;
                    case '/':
                        if(this.getBinaryParams())
                            this.result(this.params.x / this.params.y);
                        break;
                    case '%':
                        if(this.getBinaryParams())
                            this.result(this.params.x % this.params.y);
                        break;
                    case 'p':
                        if(this.getUnaryParams())
                            if(this.isPositiveInteger('n', this.params.n))
                                this.result(MathUtilities.isPrime(this.params.n));
                        break;
                    case 'np':
                        if (this.getUnaryParams())
                            if (this.isPositiveInteger('n', this.params.n))
                                this.result(MathUtilities.findPrime(this.params.n));
                        break;
                    case '!':
                        if (this.getUnaryParams())
                            if (this.isPositiveInteger('n', this.params.n))
                                this.result(MathUtilities.factorial(this.params.n));
                        break;
                    default:
                        return this.error("this opperation is not valide");

                }

            }else
                return this.error("'op' parameter is missing");
        }
        get() {
            if(this.HttpContext.path.queryString == '?'){
                this.help();
            }else{

                this.doOperation();
            }
        }
    }