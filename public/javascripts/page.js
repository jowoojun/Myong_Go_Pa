// 메뉴 숨김 및 보임
$(function(){
    $('#Mebtn').click(function() {
        if($("#Mebtn").val() == "true"){
            $("#MENU").removeClass('hidden').slideDown();
            $("#Mebtn").val("false");
        }else{
             $("#MENU").addClass('hidden').slideUp();
             $("#Mebtn").val("true");
        }
    });
    $('#sidebtn').click(function() {
        if($("#sidebtn").val() == "true"){
            $("#note").removeClass('hidden').slideDown();
            $("#sidebtn").val("false");
        }else{
             $("#note").addClass('hidden').slideUp();
            $("#sidebtn").val("true");
        }
    });
});