
//Width and height
var svgWidth = 900;
var svgHeight = 600;

margin = { "top": 25, "right": 25, "bottom": 50, "left": 50}
w =  svgWidth - margin.left - margin.right
h = svgHeight - margin.top - margin.bottom 

//Define map projection
var proj = d3.geo.mercator()
            .translate([0,0])
            .scale([1]);

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
                if(unpopulate == false){
                    locations.push(cour.cours.loc)
                }  else {
                    locations.splice(locations.indexOf(cour.cours.loc), 1)
                }

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
            }


            for(let group in cour.groups){
                let location =cour.groups[group].loc
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

    console.log("dau locations",dayLocations_)
}
function getDayLocations(btn, buttonData, dayName, unpopulate){
    this.className = 'btn-selected'
    //in order to get the data of 01 day, we nned to check of m1 button is pressed , or m2 or both.
    m1Button = document.getElementById('m1');
    m2Button = document.getElementById('m2');

    if(m1Button.className == 'btn-selected' && m2Button.className =='btn-selected'){
        //create an array with the locations in M1 and M2 in a specific day
        const iter =  Mbuttons.values();
        for(let i of iter){
            console.log(i)
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
            }
        }
    }
}

//handle the buttons click events

m1Clicked = false;
samedi = []
buttonData = []
Mbuttons = new Set()
function selectButton() {

 
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
            m1Clicked = true
            this.className = 'btn-selected'
            //populate data here
            
            getLocations(buttonData, false)
            console.log(filtered_locations)
            

        }else {
            m1Clicked = false
            this.className = 'btn'
            //unpopulate data here
            getLocations(buttonData, true)
            console.log(filtered_locations)
        }
        console.log(m1Button)


        /*TODO: handle colors */
        
        d3.select("#svg").selectAll("path")
        .data(json.features)  //usthb geojson DATA  
        .attr("d", path)
        .attr("fill" , d=>{
    

            if(d['properties'].name == "ground"){

            return "#3E768C"
            }else
            {
                
                    //console.log("loc", loc)
                    loc = (d['properties'].name)
                    loc2 = (d['properties'].name2)
                    if(d['properties'].name != undefined) loc = (d['properties'].name).toString()
                    if(d['properties'].name2 != undefined) loc2 = (d['properties'].name2).toString()
                    
                        
                        if( (filtered_locations.includes(loc) || filtered_locations.includes(loc2))  ){

                            //console.log("the locations", filtered_locations)
                            return "#23E87C"
                        }else{
                            //console.log(loc, typeof(loc))
                            //console.log("the locations2", filtered_locations)
                            return "#B3E0F2"
                        }
            }
        })
    }else{ //treat days buttons

        day = this.id
        console.log("dayButtonData", day)
        if(this.className == 'btn') getDayLocations(this, buttonData, day, false); else getDayLocations(this , buttonData, day, true)
     
    }


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
    .scaleExtent([0.8, 70]).on("zoom", function () {

        svg.attr("transform", d3.event.transform)
        zoom_stroke = d3.event.transform.k; //for the stroke width to be proportional with the zoom level
    });




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
        d3.select("#resetButton").on("click", function(){ 

            svg.transition()
            .duration(750)
            .call(zoom.transform, d3.zoomIdentity);
           
        })
    
        

       


    var b = path.bounds(json);
    console.log(b);
    s = .99 / Math.max( (b[1][0] - b[0][0]) / w , (b[1][1] - b[0][1]) / h ); 
    t = [ (w - s * (b[1][0] +b[0][0])) / 2 , (h - s * (b[1][1]+b[0][1])) / 2 ];
    //sconsole.log(s,t);
    proj.translate(t).scale(s);



    var z = d3.behavior.zoom() 

    svg.selectAll("path")
    .data(json.features)  //usthb geojson DATA  
    .each(json)        
    .enter()
    .append("path")
    .attr("d", path)
    .style('stroke-width', '0.2px')
    .attr("stroke", "#3E768C")

    .attr('transform', 'translate(250,-210)rotate(35)')
    .attr("fill" ,d =>{

        if(d['properties'].name == "ground"){
        return "#3E768C"
        }else
        {
            if( locations.includes( d['properties'].name )){
                console.log("checking the locations array...")
                return "#23E87C"
            }else{
                console.log("array doesn't include this")
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
            d3.select('#name').text(d.properties.name);

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


    /*d3.select("#m2").on("click", function(){
        
        d3.selectAll(this).style("fill", "red");
        console.log("hi")
    
    
    });*/

    
    function test() {
        
    }
    


});







