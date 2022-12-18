
//Width and height
var svgWidth = 900;
var svgHeight = 600;

margin = { "top": 25, "right": 25, "bottom": 50, "left": 50}
w =  svgWidth - margin.left - margin.right
h = svgHeight - margin.top - margin.bottom 

//Define map projection
var proj = d3.geoMercator()
            .translate([0,0])
            .scale([1])
            .rotate([30,32])


//Define path generator
var path = d3.geo.path()
        .projection(proj);
        


var zoom_stroke = 2;



//4 promises to collect all the necessary data. (usthb geojson data and the files of all semesters)

let promise1 = new Promise ((resolve, reject) =>{ 

    d3.json('usthbBrut2.geojson', usthbData => {
        if(usthbData != null){ resolve(usthbData) }else{ reject(usthbData) }
    })
});


let promise2 = new Promise ((resolve, reject) =>{  //read the schedule data of m2 s1
    d3.json('M1.json', data => {
        if(data != null){ resolve(data) }else{ reject(data) }
    });

    
});


let promise3 = new Promise ((resolve, reject) =>{ 
    d3.json('M2.json', data => {
        if(data != null){ resolve(data) }else{ reject(data) }
    })
});


var locations = []
var filtered_locations = []
var m1Button
var m2Button


function getLocations(buttonData, unpopulate){

    for(let semester in buttonData){
        for(let day in buttonData[semester].days){
            
            for(let cours in buttonData[semester].days[day]){

                cour = buttonData[semester].days[day][cours]
                //if the user click or unclick the M1 or M2 button:
                if(unpopulate == false){
                    locations.push(cour.cours.loc)
                }  else {
                    locations.splice(locations.indexOf(cour.cours.loc), 1)
                }

                //the locations exists also in "groups"
                for(let group in buttonData[semester].days[day][cours].groups){
                    let location = buttonData[semester].days[day][cours].groups[group].loc

                    //check if we need to add locations, or remove them from the list when the user unclick the button
                    if(unpopulate == false){
                        locations.push(location)
                    }  else {
                         locations.splice(locations.indexOf(location), 1)
                    }
                    
                }
                
            }   
        }
    }

    //the set function considers "undefined" as a value, so we remove it.
      filtered_locations = locations.filter(element => {
        return element !== undefined;
      }); 
      
}

dayLocations = []
dayLocations_ = [] //filtered

function populateDay(btn, buttonData, dayName, unpopulate){
    for(let semester in buttonData){
               
        day =  buttonData[semester].days[dayName]

        for(let cours in day){
            cour = day[cours]

            if(unpopulate == false){
                btn.className = 'btn-selected'
                console.log("group1",)
                dayLocations.push(cour.cours.loc)

            }  else {
                btn.className = 'btn'
                dayLocations.splice(dayLocations.indexOf(cour.cours.loc), 1)

                //TDOO: maintain previous m1, m2 data when the user unclick the day button
            }


            for(let group in cour.groups){
                let location = cour.groups[group].loc
                //check if we need to add locations, or remove them from the list when the user unclick the button
                if(unpopulate == false){
                    dayLocations.push(location)
                }  else {
                    dayLocations.splice(dayLocations.indexOf(location), 1)
                }
                
            }
        }


    }

    dayLocations_ = dayLocations.filter(element => {
        return element !== undefined;
      }); 

    //TODO: empy filteredLocations array and fill it with day_locations here
    /*filtered_locations = []
    filtered_locations = dayLocations_*/
    console.log("locations: ",filtered_locations)
    console.log("day locations: ", dayLocations_)

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

//handle the buttons click events

samedi = []
buttonData = []
Mbuttons = new Set()


function selectButton() {

    samediButton = document.getElementById('Sam');
    dimancheButton = document.getElementById('Dim');
    lundiButton = document.getElementById('Lun');
    mardiButton = document.getElementById('Mar');
    mercrediButton = document.getElementById('Mer');
    jeudiButton = document.getElementById('Jeu');

 

    if(this.id == 'm1' || this.id == 'm2'){

        buttonData = window[this.id] // get the corresponding variable bases on the button ID
        Mbuttons.add(buttonData)
        
        //set days data based on the year:

        samedi = buttonData[0].days.Sam
        dimanche = buttonData[0].days.Dim
        lundi = buttonData[0].days.Lun
        mardi = buttonData[0].days.Mar
        mercredi = buttonData[0].days.Mer
        jeudi = buttonData[0].days.Jeu        
        
        

        /* check if m1 button or m2 are pressed before checking s1 and s2*/

        if(this.className == 'btn'){
            this.className = 'btn-selected'
            //populate data here
            
            getLocations(buttonData, false)
            console.log("filtered_locations: ",filtered_locations)
            

        }else {
            if(samediButton.className == "btn" && dimancheButton.className == "btn" 
            && lundiButton.className == "btn" && mardiButton.className == "btn" && mercrediButton.className == "btn"  && mercrediButton.className == "btn" ){
            this.className = 'btn'
            //unpopulate data here
            getLocations(buttonData, true)
            console.log("filtered_locations: ",filtered_locations)
            }
        }


        /*TODO: handle colors */
        highlightPlaces(filtered_locations)

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
            }


        }
     
    }


}

function highlightPlaces(filtered_locations){


    
  



    svg = d3.select("#svg")
    loc_paths = svg.selectAll("path")
        .data(json.features)  //usthb geojson DATA  
        .attr("d", path)
        
        .attr("fill" , (d,i)=>{
            
            

            if(d['properties'].name == "ground"){

            return "#396a9b"
            }else
            {
                
                loc = (d['properties'].name)
                    loc_floor2 = (d['properties'].name2)
                    if(d['properties'].name != undefined) loc = (d['properties'].name).toString()
                    if(d['properties'].name2 != undefined) loc_floor2 = (d['properties'].name2).toString()
                    
                        
                        if( (filtered_locations.includes(loc) || filtered_locations.includes(loc_floor2))  ){

                            //console.log("the locations", filtered_locations)
                            return "#23E87C"
                        }else{
                            //console.log(loc, typeof(loc))
                            //console.log("the locations2", filtered_locations)
                            return "#B3E0F2"
                        }
            }
        })
      
}




//fetch the data: usthb geojson, M1 and M2 respectively
Promise.all([promise1, promise2, promise3]).then(function(data){
    json = data[0]
    //m1
    m1 = data[1]
    m2 = data[2]

    d3.selectAll("#m1, #m2, #s1, #s2, #Sam, #Dim, #Lun, #Mar, #Mer, #Jeu").on("click", selectButton)


    
    console.log(m2[1]);


    
    var zoom = d3.zoom()
    .scaleExtent([0.8, 70]).translateExtent([[0, 0], [w, h]]).on("zoom", function () {

        svg
        .attr("transform", d3.event.transform)
        zoom_stroke = d3.event.transform.k; //for the stroke width to be proportional with the zoom level
    });

    function reset() {
        svg.selectAll("path")
        .transition()
        .duration(10000)
        .attr("transform", d3.zoomIdentity.translateBy(0, 0).scale(1));

      }


      console.log("data is:", data[0])

      function random() { //this function will be ued to switch betweeen points animation on button click
        const [x, y] = data[Math.floor(Math.random() * data.length)];
        svg.transition().duration(2500).call(
          zoom.transform,
          d3.zoomIdentity.translate(w / 2, h / 2).scale(40).translate(-x, -y)
        );
      }



    zoom2 = d3.behavior.zoom() 
    var svg = d3.select("#svg")
        .attr("width",  w)
        .attr("height",  h)
        .style("background-color", "lavender")
        .call(zoom)
        .append("g");
    
    svg.append("text")
    .text("current place name")
    .attr("x", 80)
    .attr("y", 80)
    .attr("class", "svgText")

        //reset the zoom when choosing another schedule/ pressing the button
        d3.select("#resetButton").on("click",() =>    
        {
      
        d3.selectAll("path")
        .transition()
        .duration(500)
        .ease(ease)
        .call(zoom.transform,  d3.zoomIdentity.translate(0,0).scale(1))
    })
       


    var b = path.bounds(json);
    console.log(b);
    s = .99 / Math.max( (b[1][0] - b[0][0]) / w , (b[1][1] - b[0][1]) / h ); 
    t = [ (w - s * (b[1][0] +b[0][0])) / 2 , (h - s * (b[1][1]+b[0][1])) / 2 ];
    //sconsole.log(s,t);
    proj.translate(t).scale(s);



    var z = d3.behavior.zoom() 
    
    updatePaths(svg)





    var pathCoord = [3.1802655553270274, 36.711436405100415];


    ////////////////////////////// functions to handle the zoom effects

    function zoomTo(location, scale){
        //convert long lat to cartesian coordinates
        var point = proj(location);
        console.log("cartesian point is:", point)
       
        svg.selectAll("path")
        .transition()
        .duration(1000)
        .attr("transform", transform(point, scale))
        .on("end", zoomOut);	//when the trasition ends
    }
    
    function zoomOut(){
        svg.selectAll("path")
        .transition()
        .duration(5000)
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


    d3.select("#next").on("click", () => zoomTo(pathCoord, 10))





});


function updatePaths(svg){


    svg.selectAll("path")
    .data(json.features)  //usthb geojson DATA  
    .each(json)        
    .enter()
    .append("path")
    .attr("d", path)
    .style('stroke-width', '0.2px')
    .attr("stroke", "#3E768C")

    .attr('transform', 'translate(0,0)')
    .attr("fill" ,d =>{

        let centroid = path.centroid(d.geometry); //centroid of all paths, will be used later to zoom to specefic places
        console.log(centroid)

        if(d['properties'].name == "ground"){
        return "#396a9b"
        }else
        {
            if( filtered_locations.includes( d['properties'].name )){
                console.log("checking the locations array...")
                return "#23E87C"
            }else{
                return "#B3E0F2"
            }
        
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
            .attr("fill", "#79BED9")
            .attr("stroke", "yellow")
            .style('stroke-width', ( 2 - myScale(zoom_stroke))); //keep the stroke width proportional with the zoom level


            if(d['properties'].name != ""){
                svg.select("text") //print the place name on the screen when hovering
                .text(d['properties'].name);
            }else{
                svg.select("text") //print the place name on the screen when hovering
                .text(d['properties'].osm_way_id);
            }
        
        }

            // TOOLTIP 
            d3.select('#name').text(d.properties.name2);

            //todo: generalize this line to print the corresponding time, prof, group
            d3.select('#time').text(m1[0].days.Dim[0].groups.G1.Time);


            d3.select('#subject').text(d.properties.subject);
            d3.select('#prof').text(d.properties.prof);
            d3.select('#group').text(d.properties.group);
            d3.select('#tooltip')
              .style('left', (d3.event.pageX + 20) + 'px')
              .style('top', (d3.event.pageY - 80) + 'px')
              .style('display', 'block')
              .style('opacity', 0.8)
        
    })
    .on("mouseout", function(d){

            if(d['properties'].name != "ground"){
            d3.select(this)
            .attr("fill", "#B3E0F1")
            .style('stroke-width', '0.2px')
            .attr("stroke", "#3E768C")
            }
            
            d3.select(this).style('fill', d.color);
            d3.select('#tooltip')
              .style('display', 'none');
            
        
    })
    .append('title').text(d => d['properties'].name)

}


   







