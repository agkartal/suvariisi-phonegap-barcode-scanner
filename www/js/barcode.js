//https://cordova.apache.org/docs/en/latest/guide/cli/
//https://www.npmjs.com/package/phonegap-plugin-barcodescanner
var barkodOptions = {
    preferFrontCamera: false, // iOS and Android
    showFlipCameraButton: true, // iOS and Android
    showTorchButton: true, // iOS and Android
    torchOn: false, // Android, launch with the torch switched on (if available)
    saveHistory: true, // Android, save scan history (default false)
    prompt: "Barkodu tarama alanına yerleştirin", // Android
    resultDisplayDuration: 500, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
    //formats : "QR_CODE,PDF_417", // default: all but PDF_417 and RSS_EXPANDED
    orientation: "portrait", // Android only (portrait|landscape), default unset so it rotates with the device
    disableAnimations: true, // iOS
    disableSuccessBeep: false // iOS and Android
};

function readBarcodeTest() {
    var barcode = "B24234234";
    var barcodeRow = "<tr id=\"" + barcode + "\"><td><input type=\"button\" value=\"Sil\" onclick=removeRow(\"" + barcode + "\") /></td><td>" + barcode + "</td></tr>";
    $("#barcodeTable tbody").append(barcodeRow);

    var barcodeRow2 = "<tr id=\"deleteRow\"><td><input type=\"button\" value=\"Sil\" onclick=removeRow(\"deleteRow\") /></td><td>Barkod Okunamadı</td></tr>";
    $("#barcodeTable tbody").append(barcodeRow2);
}

function removeRow(rowId) {
    $("#barcodeTable tbody tr[id=" + rowId + "]").remove();
}

function readBarcode() {
    cordova.plugins.barcodeScanner.scan(
        function (result) {
            var barcode = result.text.replace(" ", "_");
            var barcodeRow = "<tr id=\"" + barcode + "\"><td><input type=\"button\" value=\"Sil\" onclick=removeRow(\"" + barcode + "\") /></td><td>" + barcode + "</td></tr>";
            $("#barcodeTable tbody").append(barcodeRow);
        },
        function (error) {
            var barcodeRow = "<tr id=\"deleteRow\"><td><input type=\"button\" value=\"Sil\" onclick=removeRow(\"deleteRow\") /></td><td>Barkod Okunamadı</td></tr>";
            $("#barcodeTable tbody").append(barcodeRow);
        },
        barkodOptions
    );
}

function writeTextToFile(text) {

    //window.resolveLocalFileSystemURL(cordova.file.externalRootDirectory, function(rootDirEntry) { // SD Kart için bu satır
    window.resolveLocalFileSystemURL(cordova.file.applicationStorageDirectory, function (rootDirEntry) { // data/com.suvariisi.barcode/ için bu satır
        var suvariisiFolder = "SUVARIISI";
        rootDirEntry.getDirectory(suvariisiFolder, { create: true }, function (suvariisiDirEntry) {
            var suvariisiDateFile = getTodayDateFormatted() + ".txt"; // 20200812.txt
            suvariisiDirEntry.getFile(suvariisiDateFile, {create: true, exclusive: false}, function gotFileEntry(fileEntry) {
                fileEntry.createWriter(function gotFileWriter(fileWriter) {
                    fileWriter.seek(fileWriter.length);
                    fileWriter.write(text);
                }, fail);
            }, fail);
        });
    });
}

function readTextFromFile() {

    //window.resolveLocalFileSystemURL(cordova.file.externalRootDirectory, function(rootDirEntry) { // SD Kart için bu satır
    window.resolveLocalFileSystemURL(cordova.file.applicationStorageDirectory, function (rootDirEntry) { // data/com.suvariisi.barcode/ için bu satır
        var suvariisiFolder = "SUVARIISI";
        rootDirEntry.getDirectory(suvariisiFolder, { create: true }, function (suvariisiDirEntry) {
            var suvariisiDateFile = getTodayDateFormatted() + ".txt"; // 20200812.txt
            suvariisiDirEntry.getFile(suvariisiDateFile, {create: true, exclusive: false}, function gotFileEntry(fileEntry) {
                fileEntry.file(function (file) {
                    var reader = new FileReader();
            
                    reader.onloadend = function() {
                        //console.log("Successful file read: " + this.result);
                        $('#barcodeFileContent').html(this.result.replace(/\n/g, "<br />"));
                    };
            
                    reader.readAsText(file);
            
                }, fail);
            }, fail);
        });
    });
}

function fail(error) {
    console.log(error.code);
}

function clearScreen() {
    $("#company").val("");
    $("#barcodeTable tbody").empty();
}

function getTodayDateFormatted() {
    var d = new Date();
    var datestring = d.getFullYear() + ("0" + (d.getMonth() + 1)).slice(-2) + ("0" + d.getDate()).slice(-2);
    return datestring;
}

function saveToFile() {

    var text = "";
    $('#barcodeTable tbody tr').each(function() {
        var barcodeText = $(this).find("td").eq(1).html();
        text += barcodeText + "\n";    
    });

    text += $('#company').val() + "\n";

    console.log(text);

    writeTextToFile(text);
    clearScreen();
    readTextFromFile();
    alert("Barkod kaydedildi");
}