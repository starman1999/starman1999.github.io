
//Width and height
var svgWidth = 700;
var svgHeight = 400;

margin = { "top": 25, "right": 25, "bottom": 50, "left": 50}
w =  svgWidth - margin.left - margin.right
h = svgHeight - margin.top - margin.bottom 

//Define map projection
var proj = d3.geoMercator()
            .translate([0,0])
            .scale([1])
            .rotate([10,41])


//Define path generator
var path = d3.geo.path()
        .projection(proj);
        


var zoom_stroke = 2;


//4 promises to collect all the necessary data. (usthb geojson data and the files of all semesters)

let promise1 = new Promise ((resolve, reject) =>{ 

     d3.json('projet/usthbBrut2.geojson', usthbData => {
        if(usthbData != null){ resolve(usthbData) }else{ reject(usthbData) }
    })
});



let promiseIV1 = new Promise ((resolve, reject) =>{  //read the schedule data of m2 s1
    d3.json('projet/M1.json', data => {
        if(data != null){ resolve(data) }else{ reject(data) }
    });

    
});


let promiseIV2 = new Promise ((resolve, reject) =>{ 
    d3.json('projet/M2.json', data => {
        if(data != null){ resolve(data) }else{ reject(data) }
    })
});

let promiseSII1 = new Promise ((resolve, reject) =>{  //read the schedule data of m2 s1
    d3.json('projet/specialities/M1_SII.json', data => {
        if(data != null){ resolve(data) }else{ reject(data) }
    });

    
});


let promiseSII2 = new Promise ((resolve, reject) =>{ 
    d3.json('projet/specialities/M2_SII.json', data => {
        if(data != null){ resolve(data) }else{ reject(data) }
    })
});


var locations = []
var profs = []
var unique_profs = []
var filtered_profs =[]
var filtered_locations = []
var m1Button
var m2Button


dayLocations = []
dayLocations_ = [] //filtered


//handle the buttons click events

samedi = []
buttonData = []
Mbuttons = new Set()


centroids = [] //to store the locations of paths for the zoom navigation






//fetch the data: usthb geojson, M1 and M2 respectively
Promise.all([promise1, promiseIV1, promiseIV2, promiseSII1, promiseSII2]).then(function(data){

    function getLocations(buttonData, unpopulate){

        for(let semester in buttonData){
            for(let day in buttonData[semester].days){
                
                for(let cours in buttonData[semester].days[day]){
    
                    cour = buttonData[semester].days[day][cours]
                    //if the user click or unclick the M1 or M2 button:
                    if(unpopulate == false){
                        locations.push([cour.cours.loc, cour.cours.prof, cour.cours.Subject, cour.cours.Time, "toute la section", day])
                        profs.push([cour.cours.prof, cour.cours.loc])
                        //TODO: push profs in another array here with their locations
                    }  else {
                        locations.splice(locations.indexOf([cour.cours.loc, cour.cours.prof, cour.cours.Subject, cour.cours.Time, "toute la section", day]), 1)
                        profs.splice(profs.indexOf([cour.cours.prof, cour.cours.loc]), 1)

                    }
    
                    //the locations exists also in "groups"
                    for(let group in buttonData[semester].days[day][cours].groups){

                        let location = buttonData[semester].days[day][cours].groups[group].loc
                        let prof =  buttonData[semester].days[day][cours].groups[group].prof
                        let Subject = buttonData[semester].days[day][cours].groups[group].Subject
                        let Time =  buttonData[semester].days[day][cours].groups[group].Time
    
                        //check if we need to add locations, or remove them from the list when the user unclick the button
                        if(unpopulate == false){
                            locations.push([location, prof, Subject, Time, group, day])
                            profs.push([prof, location])

                        }  else {
                             locations.splice(locations.indexOf([location, prof, Subject, Time, group, day]), 1)
                             profs.splice(profs.indexOf([prof, location]), 1)
                        }
                        
                    }
                    
                }   
            }
        }
    
        //the set function considers "undefined" as a value, so we remove it.
          filtered_locations = locations.filter(element => {
            return element[0] !== undefined;
          }); 

          filtered_profs = profs.filter(element => {
            if(element[0] != undefined) return element
          });

        
        for(i=0; i< filtered_locations.length; i++){
            if(!unique_profs.includes(filtered_locations[i][1])){

                unique_profs.push(filtered_locations[i][1])

                d3.select("#dropdown")
                .append("option")
                .attr("id", filtered_locations[i][1])   
                .text(filtered_locations[i][1])
            }
            
        }
        
  

          
    }
    
    
    
    function populateDay(btn, buttonData, dayName, unpopulate){
        for(let semester in buttonData){
                   
            day =  buttonData[semester].days[dayName]
    
            for(let cours in day){
                cour = day[cours]
    
                if(unpopulate == false){
                    btn.className = 'btn-selected'
                    console.log("group1",)
                    dayLocations.push([cour.cours.loc, cour.cours.prof, cour.cours.Subject, cour.cours.Time])

                    for(z of clickedList){

                        updateInfos(z[0], z[1], false)
                    }

                }  else {
                    btn.className = 'btn'
                    dayLocations.splice(locations.indexOf([cour.cours.loc, cour.cours.prof, cour.cours.Subject, cour.cours.Time]), 1)
                    //TDOO: maintain previous m1, m2 data when the user unclick the day button
                  
                }
    
    
                for(let group in cour.groups){
                    let location = cour.groups[group].loc
                    let prof = cour.groups[group].prof
                    let Subject = cour.groups[group].Subject
                    let Time = cour.groups[group].Time
                    //check if we need to add locations, or remove them from the list when the user unclick the button
                    if(unpopulate == false){
                        dayLocations.push([location, prof, Subject, Time, day])
                    }  else {
                        //dayLocations.splice(dayLocations.indexOf(location), 1)
                        dayLocations.splice(locations.indexOf([location, prof, Subject, Time, day]), 1)
                        
                    }
                    
                }
            }
    
    
        }
    
        dayLocations_ = dayLocations.filter(element => {
            if(element[0] != undefined) return element
          });
    
          
        //TODO: empy filteredLocations array and fill it with day_locations here
        /*filtered_locations = []
        filtered_locations = dayLocations_*/
        //console.log("locations: ",filtered_locations)
       // console.log("day locations: ", dayLocations_)
    
        highlightPlaces(dayLocations_)

        
    }
    
    
    function getDayLocations(btn, buttonData, dayName, unpopulate){
    
        //this.className = 'btn-selected'
        //in order to get the data of 01 day, we nned to check of m1 button is pressed , or m2 or both.
        m1Button = document.getElementById('m1');
        m2Button = document.getElementById('m2');
    
        if(m1Button.className == 'btn-selected' && m2Button.className =='btn-selected'){
            //create an array with the locations in M1 and M2 in a specific day
            const iter =  Mbuttons.values();
            for(let i of iter){
                console.log("locations of both m1 and m2 are:",i)
                populateDay(btn,i, dayName, unpopulate)
            }
            
        }else{
            if(m1Button.className == 'btn-selected' && m2Button.className != 'btn-selected'){
                
                populateDay(btn,buttonData, dayName, unpopulate)
    
            }else{
                if(m1Button.className != 'btn-selected' && m2Button.className == 'btn-selected'){
                    populateDay(btn,buttonData, dayName, unpopulate)
                }else{
                    //do nothing, can't select day buttons
                    alert("veuillez sélectionner au moin un semestre.")
                }
            }
        }
    }
        
    function selectButton() {

        samediButton = document.getElementById('Sam');
        dimancheButton = document.getElementById('Dim');
        lundiButton = document.getElementById('Lun');
        mardiButton = document.getElementById('Mar');
        mercrediButton = document.getElementById('Mer');
        jeudiButton = document.getElementById('Jeu');

        m1Button

        if(this.id == 'm1' || this.id == 'm2' || this.id == 'm1_profs' || this.id == 'm2_profs'){

            m1Button = document.getElementById('m1');
            m2Button = document.getElementById('m2');

            m2_prof = document.getElementById('m2_profs');
            m1_prof = document.getElementById('m1_profs');

            buttonData = window[this.id] // get the corresponding variable bases on the button ID
            Mbuttons.add(buttonData)


            //if the user clicks the m1 or m2 buttons, then click the ones for the teachers, we reset the students' buttons
            if(this.id == 'm1_profs' || this.id == 'm2_profs'){
                if(m1Button.className == 'btn-selected' || m2Button.className == 'btn-selected'){
                    zoomOut()
                    for (const item of Mbuttons) {
                        getLocations(item, true)
                      }
                    
                    highlightPlaces(filtered_locations)
                    m1Button.className = 'btn'
                    m2Button.className = 'btn'
                } 
            }
   

            
            //set days data based on the year:

            samedi = buttonData[0].days.Sam
            dimanche = buttonData[0].days.Dim
            lundi = buttonData[0].days.Lun
            mardi = buttonData[0].days.Mar
            mercredi = buttonData[0].days.Mer
            jeudi = buttonData[0].days.Jeu        
            
            

            /* check if m1 button or m2 are pressed */

            if(this.className == 'btn'){
                this.className = 'btn-selected'
                //populate data here
                
                getLocations(buttonData, false)
               // console.log("filtered_locations: ",filtered_locations)
                //console.log("profs: ", filtered_profs)

                if(this.id == "m1" || this.id == "m2"){
                    highlightPlaces(filtered_locations)
                    navigate("forward")
                }
                

            }else {
                if(samediButton.className == "btn" && dimancheButton.className == "btn" 
                && lundiButton.className == "btn" && mardiButton.className == "btn" && mercrediButton.className == "btn"  && mercrediButton.className == "btn" ){
                this.className = 'btn'

                //unpopulate data here
                getLocations(buttonData, true)
                /*TODO: handle colors */
                highlightPlaces(filtered_locations)
                navigate("forward")
                console.log("filtered_locations: ",filtered_locations)
                console.log("profs:", filtered_profs)
                }
            }


            

        }else{ //treat days buttons

            dayName = this.id
            console.log("dayButtonData", dayName)
            if(this.className == 'btn'){
                getDayLocations(this, buttonData, dayName, false)
            }  else {
                

                
                // unpopulate the locations of the selected day
                getDayLocations(this , buttonData, dayName, true); 

                //if all the days button are unselected, then show the locaitons of M1 or M2
                if(samediButton.className == "btn" && dimancheButton.className == "btn" 
                && lundiButton.className == "btn" && mardiButton.className == "btn" && mercrediButton.className == "btn"  && mercrediButton.className == "btn" ){
                    console.log("the freaking locations are:", filtered_locations)
                    highlightPlaces(filtered_locations)
                    navigate("forward")
                }


            }
        
        }


    }

    green = "#01FA4A"
    skyBlue = "#B3E0F2"
    clickedList = []

    groungou  = ['152', 'tp152', '45', '45']
    p = '152'
    groungou2 = groungou
    console.log(groungou, groungou2)
    groungou.splice(0, 1, '152')
    console.log("grounou:",groungou)
    groungou2.splice(groungou2.indexOf('152'),1)
    console.log("grounou2:",groungou2)

    function highlightPlaces(filtered_locations){
    
        centroids = [] //reinitialize the centroids array each time we highlite new places to navigate to

        svg = d3.select("#svg")
       
        loc_paths = svg.selectAll("path")
            .data(json.features)  //usthb geojson DATA  
            .attr("d", path)
            .on("click", function(d, i) {

                selectedPath = d3.select(this)

                d3.select("#shapeAnimation").classed("shapeAnimation", true)
              

                loc = (d['properties'].name).toString()
                loc2 = d['properties'].name2
                if(d['properties'].name2 != undefined) loc2 = (d['properties'].name2).toString()
                

                if(clickedList.includes(loc) && clickedList.includes(loc2)  ){ //unselect a location
                    
                    console.log( loc, loc2)
                    console.log("clickedList before removing is : ", clickedList)


                    selectedPath.classed("selected-path", false)
                    updateInfos(loc, loc2, false)
                    clickedList.splice(clickedList.indexOf(loc), 1);
                    clickedList.splice(clickedList.indexOf(loc2), 1);

                    console.log("clickedList is now:", clickedList)
                    
                }else{ //Select a location

                    if(loc != "ground")  selectedPath.classed("selected-path", true).attr("id","_" + d["properties"].name)
                   
                    console.log(loc, loc2)
                    console.log("clickedList before adding: ", clickedList)

                    updateInfos(loc, loc2, true)
                    clickedList.push(loc)
                    clickedList.push(loc2)
                    console.log("clickedList is now:", "first:",clickedList)

                }
                
                setTimeout( ()=>{
                    d3.select("#shapeAnimation").classed("shapeAnimation", false)

                }, 300)
            })
            .attr("id", function(d,i){ return "_" + i; } )
            .attr("fill" , (d,i)=>{
                
                
                if(d['properties'].name == "ground"){

                return "#396a9b"
                }else
                {
                    loc = (d['properties'].name)
                    loc_floor2 = (d['properties'].name2)
                    
                    if(d['properties'].name != undefined) loc = (d['properties'].name).toString()
                    if(d['properties'].name2 != undefined) loc_floor2 = (d['properties'].name2).toString()
                    
                       
                        
                        if( ((filtered_locations.some( a => a.includes(loc)) && loc!= null) || (filtered_locations.some( a => a.includes(loc_floor2))&& loc_floor2!= null) )  ){

                           
                            //centroid of all paths, will be used later to zoom to specefic places
                            centroid = path.centroid(d.geometry); 
                            //console.log("centorid of located path: ", centroid)
                            centroids.push([centroid, loc])

               
                            
                            d3.select("#_" + i).attr("pointer-events","auto")
                            
                            return green
                        }else{
                            //console.log(loc, typeof(loc))
                            //console.log("the locations2", filtered_locations)
                            return skyBlue
                        }
                }
            })

    }










    json = data[0]
    //m1

    var selectedSpeciality = d3.select("#specialities").node().value;
    if(selectedSpeciality =='IV'){
        m1 = data[1]
        m2 = data[2]
    
        m1_profs = data[1]
        m2_profs = data[2]
    }else{
        m1 = data[3]
        m2 = data[4]
    
        m1_profs = data[3]
        m2_profs = data[4]
    }




    d3.selectAll("#m1, #m2, #m1_profs, #m2_profs, #Sam, #Dim, #Lun, #Mar, #Mer, #Jeu").on("click", selectButton)

    //profs drowpdown selection
    d3.select("select")
    .on("change",function(d){
        prof_locs = []
        var selected = d3.select("#dropdown").node().value;
        console.log( selected );
        for(let prof of filtered_locations){
            if(prof[1] == selected){
                console.log(prof[1],"enseigne dans : ", prof[0])
                prof_locs.push([prof[0], prof[1]])
            }
        }
        if(selected != "Aucun"){
            d3.select("#selected-dropdown").text(selected+" enseigne dans les salles: " + prof_locs);
            console.log(prof_locs);
            highlightPlaces(prof_locs)
            navigate("forward")
        }
        
        else{
            d3.select("#selected-dropdown").text("veuillez sélectionner un enseignant.");
        }
    })

    //select and update informations when user clicks on path

    



    
    const zoom = d3.zoom()
    .scaleExtent([1, 25]).translateExtent([[-100, -100], [1000, 900]]).on("zoom", zoomed);


    function zoomed() {
        
        svg.selectAll("path").attr("transform", d3.event.transform);
        //console.log(d3.event.transform)
      }
    


   


    var svg = d3.select("#svg")
    
        .attr("width",  w)
        .attr("height",  h)
        .style('stroke-width', '0.2px')
        .attr("stroke", "#3E768C")
        .call(zoom)
        .append("g");
    


        svg.append("text")
        .text("current place name")
        .attr("x", 20)
        .attr("y", 50)
        .attr("id", "svg-text")
        .raise()

        svg.selectAll("#svg-text").attr("class", "svg-text")



        //reset the zoom when choosing another schedule/ pressing the button
        d3.select("#resetButton").on("click",zoomOut)
       


    var b = path.bounds(json);

    s = .99 / Math.max( (b[1][0] - b[0][0]) / w , (b[1][1] - b[0][1]) / h ); 
    t = [ (w - s * (b[1][0] +b[0][0])) / 2 , (h - s * (b[1][1]+b[0][1])) / 2 ];
    //sconsole.log(s,t);
    proj.translate(t).scale(s);



    var z = d3.behavior.zoom() 
    updatePaths(svg) //draw the default paths on the svg
    

    ////////////////////////////// functions to handle the zoom effects

    function zoomTo(point, scale){
        //convert long lat to cartesian coordinates
        console.log("cartesian point is:", point)
        svg.transition().duration(2500).call(
            zoom.transform,
            d3.zoomIdentity.translate(w / 2 -point[0]*scale , h / 2 -point[1]*scale ).scale(scale)
          )
    }
    
    function zoomOut(){
        svg.selectAll("path")
        .transition()
        .duration(2000)
        .attr("transform", "translate(0,0) scale(1)");
    }



    
    
    
    function transform(point, scale){
        //Calculations determin middle of map then subtract x and y offset
        var px = w/2 - point[0] * scale;
        var py = h/2 - point[1] * scale;
        return transformStrBuilder(px, py, scale);
    }
    
    function transformStrBuilder(px, py, scale){
        return "translate("+px+","+py+") scale("+scale+")";
    }

    centroidsIndex = 0

    d3.select("#next").on("click", () => navigate("forward")) 
    d3.select("#previous").on("click", ()=> navigate("backwards")) 




    function navigate(direction){
        
        if(direction == "forward") {
            centroidsIndex++; 
            if(centroidsIndex > centroids.length-1) centroidsIndex = 0 
            
            
        }else{
            centroidsIndex--
            if(centroidsIndex <= 0) centroidsIndex = centroids.length-1
            zoomTo(centroids[centroidsIndex][0], 25); 
        }

        if(centroids != null){
            zoomTo(centroids[centroidsIndex][0], 25); 


            svg.selectAll("path")                
            .attr("stroke" , (d,i)=>{
                
                if(d['properties'].name == centroids[centroidsIndex][1]){
                    return "yellow" 
                }

            })
            .style("stroke-width", (d) => {if(d['properties'].name == centroids[centroidsIndex][1]){ return "0.15px" }})
        }
        
        
    }

});


var slideIndex = 1;
showSlides(slideIndex);

function plusSlides(n) {
  showSlides(slideIndex += n);
}

function currentSlide(n) {
  showSlides(slideIndex = n);
}

function showSlides(n) {
  var i;
  var slides = document.getElementsByClassName("mySlides");
  var dots = document.getElementsByClassName("dot");


  if (n > slides.length) {slideIndex = 1}
    if (n < 1) {slideIndex = slides.length}
    for (i = 0; i < slides.length; i++) {
      slides[i].style.display = "none";
    }
    for (i = 0; i < dots.length; i++) {
      dots[i].className = dots[i].className.replace(" dot-active", "");
    }
  slides[slideIndex-1].style.display = "block";
  dots[slideIndex-1].className += " dot-active";
}


function updateInfos (locationName1, locationName2, clickState){
    ///TODO remove all elements in the slideshow here
    
    console.log(clickState)
    if(locationName1 != undefined) loc = locationName1
    if(locationName2 != undefined) loc_floor2 = locationName2


    if(clickState == true){
        for(i of filtered_locations){
            if(i.includes(loc) || i.includes(loc_floor2)){

                //this is to create a unique ID for the Div, so we can dynamically remove it
                horaire = i[3]
                horaire = horaire.replace(/\s+/g, '');
                horaire = horaire.replace(/:/g, '');
                
                let divs = d3.select(".slideshow-container")
                .append("div")
                .attr("id", "_"+i[0]+i[1]+horaire)
                .attr("class", "mySlides")
    
                divs.append("p").attr("id", "salle").text("Salle: "+ i[0])
    
                divs.append("p").attr("id", "enseignant").text("Enseignant: "+ i[1])
    
                divs.append("p").attr("id", "matiere").text("Matière: "+ i[2])
    
                divs.append("p").attr("id", "time").text("Horaire: "+ i[3])
    
                divs.append("p").attr("id", "groupe").text("Groupe: "+ i[4])
                divs.append("p").attr("id", "dat").text("jour: "+ i[5]).attr("class","colored-text")
    
                var dot_div = d3.select(".dot-container")
                dot_div.append("span").attr("class", "dot").on("click", currentSlide(1))
    
                d3.select("#indication").style("visibility", "hidden")
       
            }   
        }
    }else{
        //remove the informations when the user unselect a certain button
        for(i of filtered_locations){
            if(i.includes(loc) || i.includes(loc_floor2)){
                let divs = d3.select(".slideshow-container")
                
                //this is to create a unique ID for the Div, so we can dynamically remove it
                horaire = i[3]
                horaire = horaire.replace(/\s+/g, '');
                horaire = horaire.replace(/:/g, '');




                toRemove = divs.select("#_"+i[0]+i[1]+ horaire)

                var dot_div = d3.select(".dot-container")
                dot_div.select("span").remove()

                //plusSlides(1)

                toRemove.remove()

                selectedPath = d3.select("#_"+loc)
                selectedPath.classed("selected-path", false)
                
            }
        }
    }

   
   
}

function updatePaths(svg){




    svg.selectAll("path")
    .data(json.features)  //usthb geojson DATA  
      
    .enter()
    .append("path")
    .attr("d", path)
    .style('stroke-width', '0.2px')
    .attr("stroke", "#3E768C")
    .attr('transform', 'translate(0,0)')
    .attr("fill" ,d =>{

        
        //console.log("centroid:",centroid)

        if(d.properties.name == "ground"){
            
        return "#396a9b"
        }else
        {
            return "#B3E0F2"
        
        }
    })

    .on("mouseover", function(d){
        
        
        let myScale = d3.scaleLinear()
                .domain([0, 71])
                .range([0, 2]);

        console.log(2 - myScale(zoom_stroke))
        if(d['properties'].name != "ground"){ //skip the ground feature
            //console.log(d['properties'].name)
            d3.select(this)
            //.attr("fill", "#79BED9")
            .attr("stroke", "yellow")

            .style('stroke-width', "0.15px") //keep the stroke width proportional with the zoom level
            .style('cursor', "pointer")

            if(d['properties'].name != ""){
                svg.select("text") //print the place name on the screen when hovering
                .text(d['properties'].name);
            }else{
                svg.select("text") //print the place name on the screen when hovering
                .text(d['properties'].osm_way_id);
            }
        
        }

      
        
    })

    .on("mouseout", function(d){

            if(d['properties'].name != "ground"){
            d3.select(this)
            //.attr("fill", "#B3E0F1")
            .style('stroke-width', '0.2px')
            .attr("stroke", "#3E768C")
            }
            
            d3.select(this).style('fill', d.color);
            d3.select('#tooltip')
              .style('display', 'none');
            
        
    })
    .append('title').text(d => d['properties'].name)




    
}


   







