'use strict';

const recipeSearchAPIid='2a499952';
const recipeSearchAPIkey='c5e68ccb26db262d07a7a350a3573cc0';
const recipeSearchURL='https://api.edamam.com/search';
const imgRecognitionAPIkey = '7e9e51c5562243fc8f358186afb8c93a';
//const Clarifai=require('clarifai');
//const app = new Clarifai.App({apiKey: '7e9e51c5562243fc8f358186afb8c93a'});
const appID= 'dc5ab558a2024361b516bdb793651649';
const workflowVersion = 'dfebc169854e429086aceb8368662';
const modelID='bd367be194cf45149e75f01d59f77ba7';
const imgRecognitionURL = 'https://api.clarifai.com/v2/models/{THE_MODEL_ID}/outputs';
const personalAccess = '739135542f1a4cf690810856c1fada5b';
//app.models.predict(modelID,input).then()
//function to generate a list of keywords
function displayKeywords(responseJson, maxResults){
  const keywords = [];
  console.log(responseJson);
  //set as 5 because free recipe search is throttle to 5/min requests
  for (let i = 0; i < 5; i++){
    keywords[i] = responseJson.outputs[0].data.concepts[i].name;
}
console.log(keywords.join(','))
const string = keywords.join(',')
getRecipe(string,maxResults);
};
//function to call image recongition api and return keywords
function getKeywords(imageUrl, maxResults){
  var settings = {
    "url": `https://api.clarifai.com/v2/models/${modelID}/outputs`,
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
//function to display results from recipe search
function displayResults(responseJson){
    // if there are previous results, remove them
  console.log(responseJson);
  $('#results-list').empty();
  // iterate through the items array
  for (let i = 0; i < responseJson.to; i++){
    // for each video object in the items 
    //array, add a list item to the results 
    //list with the video title, description,
    //and thumbnail
    $('#results-list').append(
      `<li><h3>${responseJson.hits[i].recipe.label}</h3>
      <img src='${responseJson.hits[i].recipe.image}'>
      <ul id="js-ingredient-list + ${i}"></ul>
      <a href='${responseJson.hits[i].recipe.url}' target="_blank">link for detail instruction</a>
      
      </li>`
    )
    //a function to append the list
    for (let x = 0; x<responseJson.hits[i].recipe.ingredientLines.length;x++){
      $(`#js-ingredient-list + ${i}`).append(
        `<li>${responseJson.hits[i].recipe.ingredientLines[x]}</li>`
      )
    }
  };
  //display the results section  
  $('#results').removeClass('hidden');

};

//call back function
function watchForm() {
    $('form').submit(event => {
      event.preventDefault();
      const searchTerm = $('#js-search-term').val();
      const searchURL = $('#js-search-url').val();
      const maxResults = $('#js-max-results').val();
      $('#js-search-url').val('')
      $('#js-search-term').val('')
      if(searchTerm){
        getRecipe(searchTerm,maxResults)
      }
      else if(!searchTerm && searchURL){
        imageRecipeSearch(searchURL, maxResults)
      }
      else{'invalid'}
    });
  }
  
  $(watchForm);