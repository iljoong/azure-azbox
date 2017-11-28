/* 
 * upload.js: modified from original MSFT sample
 */
function showStatus(ajaxRequest, blobSasUri) {
    if (ajaxRequest.readyState == 4) { 
        // xmlhttp.status==200 == successful request
        //var $image = $('<img src="' + blobSasUri + '" alt="" />');
        //$("#uploadedImage").prepend($image);
        $("#msgstatus").prepend("<br>uploaded: " + blobSasUri);
    }
}

// http://stackoverflow.com/questions/190852/how-can-i-get-file-extensions-with-javascript
function getExtension(url) {
    if (url === null) {
        return "";
    }
    var index = url.lastIndexOf("/");
    if (index !== -1) {
        url = url.substring(index + 1); // Keep path without its segments
    }
    index = url.indexOf("?");
    if (index !== -1) {
        url = url.substring(0, index); // Remove query
    }
    index = url.indexOf("#");
    if (index !== -1) {
        url = url.substring(0, index); // Remove fragment
    }
    index = url.lastIndexOf(".");
    return index !== -1
        ? url.substring(index + 1) // Only keep file extension
        : ""; // No extension found
};

// Method uploads a blob to Azure Storage by using a Blob SAS URL.
// The Web Browser will add the necessary CORS headers and issue a preflight request if needed.
// blobSasUrl: Blob SAS URL already obtained through an Ajax call to own server side.
// fileDataAsArrayBuffer: an ArrayBuffer (Byte Array) containing the raw data of the file to be uploaded
function uploadFile(blobSasUrl, fileDataAsArrayBuffer) {

    $("#msgstatus").prepend("<br>start uploading");

    var ajaxRequest = new XMLHttpRequest();

    ajaxRequest.onreadystatechange = function () { return showStatus(ajaxRequest, blobSasUrl) };

    try {
        // Performing an PutBlob (BlockBlob) against storage
        ajaxRequest.open('PUT', blobSasUrl, true);

        var ext = getExtension(blobSasUrl);

        switch (ext) {
            case 'docx':
                ajaxRequest.setRequestHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
                break;
            case 'pptx':
                ajaxRequest.setRequestHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
                break;
            case 'xlsx':
                ajaxRequest.setRequestHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                break;
            case 'doc':
                ajaxRequest.setRequestHeader('Content-Type', 'application/msword');
                break;
            case 'ppt':
                ajaxRequest.setRequestHeader('Content-Type', 'application/vnd.ms-powerpoint');
                break;
            case 'xls':
                ajaxRequest.setRequestHeader('Content-Type', 'application/vnd.ms-excel');
                break;
            case 'jpg':
            case 'jpeg':
                ajaxRequest.setRequestHeader('Content-Type', 'image/jpeg');
                break;
            case 'gif':
                ajaxRequest.setRequestHeader('Content-Type', 'image/gif');
                break;
        }

        //ajaxRequest.setRequestHeader('Content-Type', 'image/jpeg');
        ajaxRequest.setRequestHeader('x-ms-blob-type', 'BlockBlob');
        ajaxRequest.send(fileDataAsArrayBuffer);
    }
    catch (e) {
        alert("can't upload the file to server.\n" + e.toString());
    }
}

// This Method is called after users selects the images for upload.
// It loops over all selected files and uploads them one by one into Azure Storage.
function handleFileSelect(evt) {
    var files = evt.target.files; // FileList object
    var ts;
    if (!Date.now) {
        Date.now = function () { return new Date().getTime(); }
    }

    // Loop through the FileList, save them and render image files as thumbnails.
    for (var i = 0, file; file = files[i]; i++) {

        ts = Date.now() / 1000 | 0;

        // Create a reader that would read the entire file data as ArrayBuffer
        var reader = new FileReader();

        // AJAX URL that would be used to request an Azure Blob SAS URL
        file.azureUri = "/sasurl" + "?blobName=" + file.name + "&ts=" + ts;

        reader.onloadend = (function (theFile) {
            return function (e) {
                // Once the reader is done reading the file bytes
                // We will issue an AJAX call against our service to get the SAS URL
                $.ajax({
                    type: 'GET',
                    url: theFile.azureUri,
                    success: function (res, status, xhr) {
                        // Called into GetBlobSasUrl to generate the SAS for the required blob
                        blobSasUrl = xhr.responseText;
                        // Now we have the right SAS url that we will use to upload the image
                        // Pass in the SAS URL and the ArrayBuffer to be uploaded
                        uploadFile(blobSasUrl, e.target.result);
                    },
                    error: function (res, status, xhr) {
                        alert("can't get sas from the server");
                    }
                });
            };
        })(file);

        // Read in the image file as a data URL, once done the reader.onloadend event is raised
        reader.readAsArrayBuffer(file);
    }
}

document.getElementById('files').addEventListener('change', handleFileSelect, false);