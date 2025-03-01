var audio = document.getElementById('audio');
audio.play();
var lis = document.querySelectorAll('ul.ba li');
lis.forEach(li => {
    li.onclick = function() {
        audio.src = 'assets/' + this.getAttribute('m') + '.mp3';
        audio.play();
        console.log(this.innerHTML)
    }
});