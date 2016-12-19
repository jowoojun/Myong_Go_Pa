// input태그 타당성 체크
$(document).ready(function() {
    $('.signupValidate').bootstrapValidator({
        message: 'This value is not valid',
        feedbackIcons: {
            valid: 'glyphicon glyphicon-ok',
            invalid: 'glyphicon glyphicon-remove',
            validating: 'glyphicon glyphicon-refresh'
        },
        fields: {
            name: {
                validators: {
                    notEmpty: {
                        message: '이름을 입력해주세요.'
                    },
                    stringLength: {
                        min: 2,
                        max: 10,
                        message: '2~10글자의 이름을 입력해주세요.'
                    }
                }
            },
            email: {
                validators: {
                    notEmpty: {
                        message: '로그인 아이디로 사용할 이메일을 입력해주세요.'
                    },
                    emailAddress: {
                        message: '@가 붙은 제대로된 이메일을 입력해주세요.'
                    }
                }
            },
            password: {
                validators: {
                    notEmpty: {
                        message: '비밀번호를 입력해주세요.'
                    },
                    stringLength: {
                        min: 6,
                        max: 20,
                        message: '최소 6자 이상의 비밀번호를 입력해주세요.'
                    }
                }
            }
        }
    });
});