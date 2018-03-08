canvas = document.querySelector('#canvas');
c = canvas.getContext('2d');

var player;
var balls;
var squares;
var points;

var vectorjednostkowy = function(aX, aY, bX, bY){
  var vector = [bX - aX, bY - aY];
  var x = 1/Math.sqrt(vector[0]*vector[0]+vector[1]*vector[1]);
  return [vector[0]*x, vector[1]*x];
}

var ballColision = function(aX,aY,aR,bX,bY,bR){
  var pointDistance = Math.sqrt(Math.pow(aX-bX,2) + Math.pow(aY-bY,2));
  var sumOfR = aR+bR;
  return (pointDistance <= sumOfR);
}

var spawnSquares = function(){
  for(let i = 0; i<8; i++){
    if(Math.random()>0.75){
      points.push(new Point(25+45*i,30));
    }
    else if(Math.random()>0.7){
      squares.push(new Square(5+45*i,10,player.balls,'#b10'));
    }
    else if(Math.random()>0.7){
      squares.push(new Square(5+45*i,10,player.balls*2,'#00f'));
    }
}
}

var Mouse = function(){
  this.x = null;
  this.y = null;
}
var mouse = new Mouse();

window.addEventListener('resize', function(){
  init();
});

canvas.addEventListener('mousemove', function(e){
  mouse.x = e.layerX;
  mouse.y = e.layerY;
});

canvas.addEventListener('click', function(e){
  if(player.canShoot){
    player.shoot = true;
    player.canShoot = false;
  }
});

var Player = function(){
  this.balls = 10;
  this.ballsLeft = 0;
  this.x = 200;
  this.y = 547;
  this.pointerLength = 40;
  this.shoot = false;
  this.canShoot = true;
  this.destinationX = null;
  this.destinationY = null;
  this.skipShoot = false;

  this.drawPointer = function(){
    c.beginPath();
    c.moveTo(this.x, this.y);
    let v=vectorjednostkowy(this.x, this.y, mouse.x, mouse.y);
    c.lineTo(this.x+v[0]*40, this.y+v[1]*40);
    c.strokeStyle = "#f00";
    c.stroke();
  }

  this.drawPosition = function(){
    c.beginPath();
    c.arc(this.x, this.y, 1, 0, 2* Math.PI, false);
    c.strokeStyle = "#aaa";
    c.fillStyle = "#aaa";
    c.fill();
    c.stroke();
  }

  this.drawPoints = function(){
    c.fillStyle = "#a0f";
    c.font = "18px Verdana";
    c.fillText(this.balls, canvas.width-28, 24);

  }

  this.shooting = function(){
      if(this.ballsLeft==0){
        this.ballsLeft = this.balls;
        this.destinationX = mouse.x;
        this.destinationY = mouse.y;
      }

      if(this.skipShoot == true){this.skipShoot = false; return;}
      else this.skipShoot = true;
      let v = vectorjednostkowy(this.x, this.y, this.destinationX, this.destinationY);
      balls.push(new Ball(this.x,this.y,v[0],v[1]));

      this.ballsLeft --;
      if(this.ballsLeft==0)this.shoot=false;
  }

  this.update = function(){
    this.drawPointer();
    this.drawPosition();
    this.drawPoints();
  }
}

var Square = function(x,y,hp, color){
  this.x = x;
  this.y = y;
  this.hp = hp;
  this.w = 40;
  this.color = color;

  this.draw = function(){
    c.beginPath();
    c.rect(this.x, this.y, this.w, this.w);
    c.strokeStyle = this.color;
    c.fillStyle = this.color;
    c.stroke();
    c.fillText(this.hp, this.x+12, this.y+25);
  }

  this.update = function(){

    this.draw();
  }
}

var Point = function(x,y){
  this.x=x;
  this.y=y;
  this.r=5;
  this.dead = false;

  this.draw = function(){
    c.beginPath();
    c.arc(this.x,this.y,this.r,0,2*Math.PI,false);
    c.strokeStyle="#ff1";
    c.fillStyle="#ff1";
    c.fill();
    c.stroke();
  }
}

var Ball = function(x,y,dx,dy){
  this.x = x;
  this.y = y;
  this.dx = dx;
  this.dy = dy;
  this.r = 2;
  this.speed = 4;
  this.delete = false;

  this.draw = function(){
    c.beginPath();
    c.arc(this.x, this.y, this.r, 0, 2* Math.PI, false);
    c.strokeStyle = "#fa0";
    c.fillStyle = "#fa0";
    c.fill();
    c.stroke();
  }

  this.checkObstacles = function(){
    if(this.y-this.r<=0)//check for top end of screan
      this.dy*=-1;
    if(this.x+this.r>=canvas.width)//check for right end of screan
      this.dx*=-1;
    if(this.x-this.r<=0)//check for left end of screan
      this.dx*=-1;
    if(this.y+this.r>=canvas.height){//check for bottom end of screan
      this.delete = true;
      player.x = this.x;
    }

    for(let i = 0; i< points.length; i++){
      if(ballColision(this.x,this.y,this.r,points[i].x,points[i].y,points[i].r) && points[i].dead!=true){
        points[i].dead = true;
        player.balls++;
      }
    }

    for (let i = 0; i < squares.length; i++) {
        //bottom side of squares
        if(this.y-this.r <= squares[i].y+squares[i].w&&
           this.y+this.r >= squares[i].y+squares[i].w&&
           this.x+this.r >= squares[i].x &&
           this.x-this.r <= squares[i].x+squares[i].w&&
           this.dy<0){
             squares[i].hp--;
             this.dy*=-1;
           }

        //left side of squares
        else if(this.x+this.r>=squares[i].x &&
           this.x+this.r<=squares[i].x+squares[i].w &&
           this.y>=squares[i].y &&
           this.y<=squares[i].y+squares[i].w &&
           this.dx>0){
             squares[i].hp--;
             this.dx*=-1;
           }

        //right side of squares
        else if(this.x-this.r<=squares[i].x+squares[i].w &&
                this.x-this.r>=squares[i].x &&
                this.y>=squares[i].y &&
                this.y<=squares[i].y+squares[i].w &&
                this.dx<0){
                  squares[i].hp--;
                  this.dx*=-1;
                }
        //top side of squares
        else if(this.y+this.r>=squares[i].y &&
                this.y-this.r<=squares[i].y &&
                this.x+this.r >= squares[i].x &&
                this.x-this.r <= squares[i].x+squares[i].w&&
                this.dy>0){
                  squares[i].hp--;
                  this.dy*=-1;
                }
}
}

  this.update = function(){
    this.x+=this.dx*this.speed;
    this.y+=this.dy*this.speed;
    this.checkObstacles();

    this.draw();
  }
}

var init = function(){
  player = new Player();
  balls = [];
  squares = [];
  points =[];
  spawnSquares();
}


var fps = 60;
var now;
var then = Date.now();
var interval = 1000/fps;
var delta;

var animation = function(){
  requestAnimationFrame(animation);
  now = Date.now();
  delta = now - then;
  if(delta>interval){//code goes here
  c.clearRect(0,0,canvas.width,canvas.height);
  player.update();//narysuj celownik i pozycje wystrzalu



  if(player.shoot){//if player is in shoot state
    player.shooting();//wystrzel kulke
  }

  for (var i = 0; i < squares.length; i++) {//przelec przez kwadraty
    if(squares[i].hp<=0){//jak kwadrat bez zycia
      squares.splice(i,1);
      i--;
    }

    squares[i].update();//narysuj kwadrat
  }

  for(var i = 0; i < points.length; i++){//narysuj punkty
    if(points[i].dead){
      points.splice(i,1);
      i--;
    }
    points[i].draw();
  }

  for (var i = 0; i < balls.length; i++) {
    balls[i].update();//update and draw ball position
    if(balls[i].delete){//delete ball if her delete state is true(she touched bottom)
      balls.splice(i,1);
      i--;
    }


    if(balls.length == 0){//jak nie ma pilek
      player.canShoot = true;//no balls left you can shoot again
      for (var i = 0; i < squares.length; i++) {//przelec przez kwadraty
        squares[i].y+=45;//i je obniz o stopien
      }
      for (var i = 0; i < points.length; i++) {//przelec przez punkty
        points[i].y+=45;//i je obniz
      }

      spawnSquares();//zespawnuj itemy
      if(squares[0].y+squares[0].w>=canvas.height)init();//jak kwadratt wystaje przegrales nowa mapa
    }
  }
  //code ends here
  then = now - (delta % interval);
}
}



init();
animation();
