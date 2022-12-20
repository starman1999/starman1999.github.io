
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

     d3.json('projet/usthbBrut2.geojson', usthbData => {
        if(usthbData != null){ resolve(usthbData) }else{ reject(usthbData) }
    })
});


let promise2 = new Promise ((resolve, reject) =>{  //read the schedule data of m2 s1
    d3.json('projet/M1.json', data => {
        if(data != null){ resolve(data) }else{ reject(data) }
    });

    
});


let promise3 = new Promise ((resolve, reject) =>{ 
    d3.json('projet/M2.json', data => {
        if(data != null){ resolve(data) }else{ reject(data) }
    })
});

var locations = []
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
Promise.all([promise1, promise2, promise3]).then(function(data){

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
            
            

            /* check if m1 button or m2 are pressed */

            if(this.className == 'btn'){
                this.className = 'btn-selected'
                //populate data here
                
                getLocations(buttonData, false)
                console.log("filtered_locations: ",filtered_locations)
                highlightPlaces(filtered_locations)
                navigate("forward")

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

    
    function highlightPlaces(filtered_locations){

    
        centroids = [] //reinitialize the centroids array each time we highlite new places to navigate to

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

                                //centroid of all paths, will be used later to zoom to specefic places
                                centroid = path.centroid(d.geometry); 
                                console.log("centorid of located path: ", centroid)
                                centroids.push([centroid, loc])

                                //console.log("the locations", filtered_locations)
                                return "#01FA4A" //orange color
                            }else{
                                //console.log(loc, typeof(loc))
                                //console.log("the locations2", filtered_locations)
                                return "#B3E0F2"
                            }
                }
               
            })
            

            console.log("ALL centroids: ", centroids)
            
           
    }






    json = data[0]
    //m1
    m1 = data[1]
    m2 = data[2]

    d3.selectAll("#m1, #m2, #s1, #s2, #Sam, #Dim, #Lun, #Mar, #Mer, #Jeu").on("click", selectButton)
    
    



    
    const zoom = d3.zoom()
    .scaleExtent([1, 10]).translateExtent([[-100, -100], [1000, 900]]).on("zoom", zoomed);


    function zoomed() {
        
        svg.selectAll("path").attr("transform", d3.event.transform);
        //console.log(d3.event.transform)
      }
    

    function reset() {
        
        svg.transition().duration(750).call(
          zoom.transform,
          d3.zoomIdentity.translate(w / 2, h / 2).scale(1),
          d3.pointer
        );
      }

   


    var svg = d3.select("#svg")
    
        .attr("width",  w)
        .attr("height",  h)
        .style('stroke-width', '0.2px')
        .attr("stroke", "#3E768C")
        .style("background-color", "#B3E0F2")
        .call(zoom)
        .append("g");
    
        svg.append("text")
        .text("current place name")
        .attr("x", 80)
        .attr("y", 80)
        .attr("class", "svgText")

        d3.select("#svg")
        .append("button")
        .text("wiggle")
        .attr("float", "left")
        .on("click", zoomOut);

        //reset the zoom when choosing another schedule/ pressing the button
        d3.select("#resetButton").on("click",zoomOut)
       


    var b = path.bounds(json);
    console.log(b);
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
            zoomTo(centroids[centroidsIndex][0], 10); 
        }

        if(centroids != null){
            zoomTo(centroids[centroidsIndex][0], 10); 


            svg.selectAll("path")                
            .attr("stroke" , (d,i)=>{
                
                if(d['properties'].name == centroids[centroidsIndex][1]){
                    return "yellow" //green color
                }

            })
            .style("stroke-width", (d) => {if(d['properties'].name == centroids[centroidsIndex][1]){ return "0.3px" }})
        }
        
        
    }

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

        
        //console.log("centroid:",centroid)

        if(d['properties'].name == "ground"){
            
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
            .style('stroke-width', "0.5px"); //keep the stroke width proportional with the zoom level


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


   







