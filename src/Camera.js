class Camera{
    constructor(){
        this.eye = new Vector(0,0,3);
        this.at = new Vector(0,0,-100);
        this.up = new Vector(0,1,0);
    }

    forward(){
        var f = this.at.subtract(this.eye);
        f = f.divide(f.length());
        this.at.add(f);
        this // to be continued
    }
}