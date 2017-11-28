function copyclip(selector){
    var $temp = $("<div>");
    $("body").append($temp);
    $temp.attr("contenteditable", true)
         .html($(selector).html()).select()
         .on("focus", function() { document.execCommand('selectAll',false,null) })
         .focus();
    document.execCommand("copy");
    $temp.remove();

    alert("copied to clipboard");
}