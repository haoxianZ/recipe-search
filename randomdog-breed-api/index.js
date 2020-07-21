'use strict';

function getDogImage(breed) {
  fetch(`https://dog.ceo/api/breed/${breed}/images/random
`)
    .then(response => response.json())
    .then(responseJson => 
      displayResults(responseJson))
    .catch(error => alert('Something went wrong. Try again later.'));
}

function displayResults(responseJson) {
  console.log(responseJson);
  if (responseJson.status == 'error') {
    $('.results-img').replaceWith(
    '<h3 class = "results-img">the breed you enter is no found</h3>'
  )
  $('.results').removeClass('hidden');
  }
  //replace the existing image with the new one
  else{$('.results-img').replaceWith(
    `<img src="${responseJson.message}" class="results-img">`
  )
  //display the results section
  $('.results').removeClass('hidden');
}}

function watchForm() {
  $('form').submit(event => {
    event.preventDefault();
    let breed = $('.js-text').val();
    console.log(breed)
    getDogImage(breed);
  });
}

$(function() {
  console.log('App loaded! Waiting for submit!');
  watchForm();
});