const clickMe = () => {
    alert("Thanks for clicking me. Hope you have a nice day!")
}
$(document).ready(function () {
    // $('.materialboxed').materialbox();
    $('#clickMeButton').click(() => {

            $.ajax({url: "/addTwoNumber?n1=1=&n2=3", success: function(result){
              alert(result.data) 
            }});
         
    })
});