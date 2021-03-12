# fcc-form-477

The goal is to provide a base-line for reading an MS Excel(TM) file, producing a Form-477 text file.

### Quick Start

`yarn install`
`node ./src/index.js ./test.xlsx`

Challenges:

- Find an open API to perform Geocoding on the addresses
- Find an open API to convert lat/long into Census block values

`06|067|001101|1085`
06      California
067     Sacramento County
001101  Tract 11.01
1085    Block 1085

06 – identifies California,
    067 – identifies Sacramento County within California,
        001101 – identifies Census Tract 11.01 within Sacramento County and
            1085 – identifies Census Block 1085 within tract 11.01.

### Resources

[Fixed Broadband Deployment PDF](https://us-fcc.app.box.com/v/FBDFormatting)
[More About Census Blocks](https://transition.fcc.gov/form477/Geo/more_about_census_blocks.pdf)