// update json

const fs = require('fs');
const fileName = './test.json';
const file = require(fileName);
    
file.features.push(    {
    "type": "Feature",
    "properties": {},
    "geometry": {
      "coordinates": [
        [
          [
            3.1817439242896057,
            36.712056097767444
          ],
          [
            3.18179711699878,
            36.711990334223145
          ],
          [
            3.181851190755225,
            36.71201940373362
          ],
          [
            3.1817972528670566,
            36.712084169004626
          ],
          [
            3.1817439242896057,
            36.712056097767444
          ]
        ]
      ],
      "type": "Polygon"
    }
  },
  {
    "type": "Feature",
    "properties": {
    },
    "geometry": {
      "coordinates": [
        [
          [
            3.181652098147026,
            36.71216625708037
          ],
          [
            3.1817052908562005,
            36.71210049353607
          ],
          [
            3.1817593646126454,
            36.712129563046545
          ],
          [
            3.181705426724477,
            36.71219432831755
          ],
          [
            3.181652098147026,
            36.71216625708037
          ]
        ]
      ],
      "type": "Polygon"
    }
  })

  for (var i=2;i<40;i++)
  {
    file.features.push(    {
        "type": "Feature",
        "properties": {"nom":(i%2==1)?234+(i-1):238-i,
                        "id":(i%2==1)?234+(i-1):238-i,
                        "etage":2},
        "geometry": {
          "coordinates": [
            [
              [ //3eme point
                file.features[i-2].geometry.coordinates[0][0][0]-0.00005332857,
                file.features[i-2].geometry.coordinates[0][0][1]-0.00002807123

              ],
              [  // 4 eme point
                file.features[i-2].geometry.coordinates[0][1][0]-0.00005332857,
                file.features[i-2].geometry.coordinates[0][1][1]-0.00002807123

              ],
              [// 1er point
                file.features[i-2].geometry.coordinates[0][1][0],
                file.features[i-2].geometry.coordinates[0][1][1]
              ],
              [ // 2 eme point
                file.features[i-2].geometry.coordinates[0][0][0],
                file.features[i-2].geometry.coordinates[0][0][1]
              ],
              [
                file.features[i-2].geometry.coordinates[0][0][0]-0.00005332857,
                file.features[i-2].geometry.coordinates[0][0][1]-0.00002807123
              ]
            ]
          ],
          "type": "Polygon"
        }
      })
    
  }
    
fs.writeFile(fileName, JSON.stringify(file), function writeJSON(err) {
  if (err) return console.log(err);
  console.log(JSON.stringify(file));
  console.log('writing to ' + fileName);
});
