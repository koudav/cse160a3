class MapNode {
    constructor(){
        this.cube = new Cube();
        this.coords = [0,0,0];
    }

    setCube(cube) {
        this.cube = cube;
    }

    setCoords(coords) {
        this.coords = coords;
    }
}