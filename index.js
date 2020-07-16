'use strict';
//list of key and url for APIs
const recipeSearchAPIid='2a499952';
const recipeSearchAPIkey='c5e68ccb26db262d07a7a350a3573cc0';
const recipeSearchURL='https://api.edamam.com/search';
const imgRecognitionAPIkey = '7e9e51c5562243fc8f358186afb8c93a';
//const appID= 'dc5ab558a2024361b516bdb793651649';
//const workflowVersion = 'dfebc169854e429086aceb8368662';
const modelID='bd367be194cf45149e75f01d59f77ba7';
const imgRecognitionURL = `https://api.clarifai.com/v2/models/${modelID}/outputs`;
//function to generate a list of keywords
function displayKeywords(responseJson, maxResults){
  const keywords = [];
  console.log(responseJson);
  //set as 5 because too many keywords will return no result
  for (let i = 0; i < 5; i++){
    keywords[i] = responseJson.outputs[0].data.concepts[i].name;
}
console.log(keywords.join(','))
const stringKeywords = keywords.join(',')
//showing user the keywords extracted from their image
$('#js-search-term').val(stringKeywords)
getRecipe(stringKeywords,maxResults);

};
//function to call image recongition api and return keywords
function getKeywords(imageUrl, maxResults){
  var settings = {
    "url": imgRecognitionURL,
    "method": "POST",
    "timeout": 0,
    "headers": {
      "Authorization": `Key ${imgRecognitionAPIkey}`,
      "Content-Type": "application/json"
    },
    "data": JSON.stringify({"inputs":[{"data":{"image":{"url":`${imageUrl}`}}}]}),
  };
  $.ajax(settings).done(response => {
      return response.json();
  }).then(responseJson => displayKeywords(responseJson,maxResults))
  .catch(err => {
    $('#js-error-message').text(`Something went wrong: ${err.message}`);
});
};
//a function to use return keyword string to search for recipe. 
function imageRecipeSearch(imageUrl, maxResults){
  getKeywords(imageUrl,maxResults)
};
//a function to format params from object to string
function formatQueryParams(params) {
    const queryItems = Object.keys(params)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    return queryItems.join('&');
};
//function to perform recipe search base on keyword
function getRecipe(keyword, maxResults){
    const params = {
        q: keyword,
        app_id: `${recipeSearchAPIid}`,
        app_key:`${recipeSearchAPIkey}`,
        to: maxResults
      };
      const queryString = formatQueryParams(params)
      const url = recipeSearchURL + '?' + queryString;
      const proxyurl = "https://cors-anywhere.herokuapp.com/";

      console.log(url);
      fetch(url)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then(responseJson => displayResults(responseJson))
    .catch(err => {
      $('#js-error-message').text(`Something went wrong: ${err.message}`);
    });
};
//a function to append the list
function generateList(array,ID,x){
  
  for (let x = 0; x<array.length;x++)
  {
      $(`#${ID}`).append(
        `<li>${array[x]}</li>`
      )
  }
};
//function to display results from recipe search
function displayResults(responseJson){
    // if there are previous results, remove them
  console.log(responseJson);
  $('#results-list').empty();
  //check if there is any recipe return
  if(responseJson.count == 0){
    console.log('count is 0 running')
    $('#results').removeClass('hidden');
    return $('#results-list').append('Sorry, Nothing is found! Please try reducing or change your keywords')
  }
  // iterate through the items array
  for (let i = 0; i < responseJson.to; i++){
    // for each video object in the items 
    //array, add a list item to the results 
    //list with the video title, description,
    //and thumbnail
    $('#results-list').append(
      `<li><h3>${responseJson.hits[i].recipe.label}</h3>
      <img src='${responseJson.hits[i].recipe.image}'>
      <a href='${responseJson.hits[i].recipe.url}' target="_blank">link for detail instruction</a>
      </li>`
    )
    //create id for each
    $('#results-list').append(
      $('<div/>', { id: 'list' + i})
    )
    //call function to append ingredient list
    const currentID = "list" + i;  
    generateList(responseJson.hits[i].recipe.ingredientLines, currentID, i)
  };
  //display the results section  
  $('#results').removeClass('hidden');

};
//function to turn upload image to base64
function encodeImageFileAsURL(element) {
  var file = element[0].files[0];
  var reader = new FileReader();
  reader.onloadend = function() {
    console.log('RESULT', reader.result)
  }
  reader.readAsDataURL(file);
}
//call back function
function watchForm() {
    $('form').submit(event => {
      event.preventDefault();
      const searchTerm = $('#js-search-term').val();
      const searchURL = $('#js-search-url').val();
      const maxResults = $('#js-max-results').val();
      const searchFile = $('#js-search-file').val();
      console.log(searchFile)
      if (!searchURL && !searchTerm && !searchFile){
        $('#js-error-message').append('insert one input')
      }
      $('#js-search-url').val('')
      $('#js-search-term').val('')
      $('#js-max-results').val('')
      if(searchFile){
       searchURL = encodeImageFileAsURL(searchFile);
       console.log(searchURL)
       imageRecipeSearch(searchURL, maxResults)
      }
      else if(searchTerm && !searchURL){
        getRecipe(searchTerm,maxResults)
      }
      else if(!searchTerm && searchURL){
        imageRecipeSearch(searchURL, maxResults)
      }
      else if(searchURL && searchTerm){
        return $('.error-message').append('Please only use one method of input')
      }
      else{'invalid'}
    });
};
//load function  
$(watchForm);