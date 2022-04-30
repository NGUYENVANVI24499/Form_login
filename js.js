

//doi tuong validator
function validator(option){

    function getParent(element, selector){
        while(element.parentElement){
            if(element.parentElement.matches(selector)){
                return element.parentElement;
            }
            element = element.parentElement;
        }
    }
    var selectorRules ={};
    //hàm thực hiện validate
    function validate(inputElement , rule){
        var errorElement = getParent(inputElement,option.formGroubSelector).querySelector(option.errorSelector);
        var errorMessage;
       
        // lấy ra các rules của cá selector
        var rules = selectorRules[rule.selector];
        
        // lặp qu từng rules và ktra
        for(var i = 0 ; i <rules.length; ++i){
             errorMessage = rules[i](inputElement.value);
             if(errorMessage) break;
        }

        if(errorMessage){
            errorElement.innerText = errorMessage;
            getParent(inputElement,option.formGroubSelector).classList.add('invalid')
        }else{
            errorElement.innerText = '';
            getParent(inputElement,option.formGroubSelector).classList.remove('invalid')
        }

        return !errorMessage;

    }

    // lấy element của form
    var formElement = document.querySelector(option.form);

    if(formElement){
        formElement.onsubmit = function(e){
             e.preventDefault();

            var isFormValid = true;

            // lặp qua từng rules lặp qua
            option.rules.forEach(function(rule){
                var inputElement = formElement.querySelector(rule.selector);
                var isVlaid= validate(inputElement , rule);
                if(!isVlaid){
                    isFormValid = false;
                }
            });

            if(isFormValid){
                // trường hợp  submit  với javascrip
                if(typeof option.onSubmit ==='function'){
                    var enableInputs = formElement.querySelectorAll('[name]:not([disabled])');
                    var formValues = Array.from(enableInputs).reduce(function(value, input){
                        value[input.name] = input.value
                        return  value; 
                    },{});

                   
                    option.onSubmit(formValues);
                }
                //trường hợp  submit với hàng động mặc định
                else{
                    // hành động mặt định
                    formElement.submit();
                }
            }
            else{
                console.log('có lỗi')
            }
        }


        //xử lý lặp qua mỗi rule và sử lý(lắng nghe sự kiện)
        option.rules.forEach(function(rule){
            // lưu lại các rules cho mỗi input
            if(Array.isArray(selectorRules[rule.selector])){
                selectorRules[rule.selector].push(rule.test);
            }
            else{
                selectorRules[rule.selector]= [rule.test];

            }

            var inputElement = formElement.querySelector(rule.selector);
           
            if(inputElement){
                //xử lý trường hợp blur khỏi input
                inputElement.onblur = function(){
                    // value: inputElement.value
                    // test func: rule.test
                    validate(inputElement , rule);
                   
                }

                //sử lý mỗi khi người dùng nhập vào input
                inputElement.oninput = function(){
                    var errorElement = getParent(inputElement,option.formGroubSelector).querySelector(option.errorSelector);
                    getParent(inputElement,option.formGroubSelector).classList.remove('invalid')
                    errorElement.innerText = '';
                }

            }
        })
    }
}

//dinh nghia
// nguyên tắc các rules
//1 khi có lỗi => trả mesage lỗi
//2 khi hợp lệ =>không trả gì
validator.isRequired = function (selector){
    return {
        selector:selector,
        test:function(value){
            return value.trim() ? undefined : 'Vui lòng nhập trường này'
        }
    }
}
validator.isEmail = function(selector){
    return {
        selector:selector,
        test:function(value){
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined : 'Trường này phải là email'
        }
    }
}
validator.minLength = function(selector,min){
    return {
        selector:selector,
        test:function(value){
            
            return value.length>=min ? undefined : `Vui lòng nhập tối thiểu ${min} ký tự`
        }
    }
}
validator.isConfirmed = function(selector, getCofirmValue,mesage){
    return{
        selector:selector,
        test:function(value){
            return value === getCofirmValue() ? undefined : mesage || 'Giá trị nhập vào không chính xác'; 
        }
    }
}