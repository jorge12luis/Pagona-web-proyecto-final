const slides = document.querySelectorAll(".slide");
const indicators = document.querySelector(".indicators");

let index = 0;

slides.forEach((_, i)=>{

    const dot = document.createElement("div");
    dot.classList.add("dot");

    if(i===0){
        dot.classList.add("active");
    }

    dot.addEventListener("click", ()=>{

        index = i;
        showSlide();

    });

    indicators.appendChild(dot);

});

function showSlide(){

    const dots = document.querySelectorAll(".dot");

    slides.forEach(slide=>{
        slide.classList.remove("active");
    });

    dots.forEach(dot=>{
        dot.classList.remove("active");
    });

    slides[index].classList.add("active");
    dots[index].classList.add("active");

}

setInterval(()=>{

    index++;

    if(index >= slides.length){
        index = 0;
    }

    showSlide();

},5000);