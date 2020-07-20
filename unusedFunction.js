//function to turn upload image to base64
function encodeImageFileAsURL(element) {
    var file = element[0].files[0];
    var reader = new FileReader();
    reader.onloadend = function() {
      console.log('RESULT', reader.result)
    }
    reader.readAsDataURL(file);
  };
  //function to search through upload image
function fileRecipeSearch(searchFile){
    let myHeaders = new Headers();
    myHeaders.append("Authorization", "Key 7e9e51c5562243fc8f358186afb8c93a");
    myHeaders.append("Content-Type", "application/json");
    const raw = JSON.stringify({"inputs":[{"data":{"image":{"base64":`$(base64 ${searchFile}`}}}]});

    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow'
    }

    fetch("https://api.clarifai.com/v2/models/bd367be194cf45149e75f01d59f77ba7/outputs", requestOptions)
      .then(response => response.text())
      .then(result => console.log(result))
      .catch(error => console.log('error', error))

};
