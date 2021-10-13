let opt=document.querySelector('.opt');
let menu=document.querySelector('.menuicon');
let ordermessage=document.querySelector('.placed');
let orderdisplay=document.querySelector('.hide');

console.log(orderdisplay);

menu.addEventListener('click', ()=>{
    opt.classList.toggle('pages');
});

ordermessage.addEventListener('click', ()=>{
    orderdisplay.classList.toggle('hide');
});

