const { lerp, clamp } = require("../GameMath");
const { Vec2 } = require("../Vector");

// Empty particle base class
export class Particle
{
    constructor(game, x, y, v, color, lifeTime)
    {
        this.game = game;
        this.x = x;
        this.y = y;
        this.v = v;
        this.color = color;
        this.age = 0;
        this.lifeTime = lifeTime;
        this.dead = false;
    }

    update(dt)
    {
        this.x += this.v.x * dt;
        this.y += this.v.y * dt;
        this.age += dt;
        
        // // exponential color
        // const k = dt / this.lifeTime * 5;
        // let newA = lerp(this.color.a, 0, k);
        // this.color.a = clamp(Math.floor(newA), 0, 255);
        
        // linear color
        let b = 1 - this.age / this.lifeTime;
        this.color.a = clamp(Math.floor(255 * b), 0, 255);


        if (this.age > this.lifeTime)
        {
            this.dead = true;
        }
    }

    draw() {}
}

export class SphereParticle extends Particle
{
    constructor(game, x, y, r, v, color, lifeTime)
    {
        super(game, x, y, v, color, lifeTime);
        this.radius = r;
    }

    update(dt)
    {
        super.update(dt);
        this.radius += 0.04 * dt;
    }

    draw(ctx, camera)
    {
        let pos = camera.WorldToCanvas({ x: this.x, y: this.y });
        let r = camera.WorldToCanvasScale(this.radius);

        ctx.fillStyle = this.color.toHex();
        ctx.beginPath();
        ctx.ellipse(pos.x, pos.y, r, r, 0, 0, 6.283);
        ctx.fill();
    }
}

export class ShardParticle extends Particle
{
    constructor(game, vertices, v, color, lifeTime)
    {
        // x, y not needed, set to 0
        super(game, 0, 0, v, color, lifeTime);
        
        // this.lineWidth = 6;

        this.vertices = [];
        for (let { x, y } of vertices)
        {
            this.vertices.push(new Vec2(x, y));
        }
    }

    update(dt)
    {
        super.update(dt); 

        // velocity
        const ds = new Vec2(this.v.x, this.v.y).mult(dt);
        for (let i = 0; i < this.vertices.length; i++)
        {
            this.vertices[i] = this.vertices[i].add(ds);
        }

        // this.lineWidth += 8 * dt;

        // expand from centerpoint M by factor of k
        let k = .7 * dt;
        let M = new Vec2();
        for (let i = 0; i < this.vertices.length; i++)
        {
            M = M.add(this.vertices[i]);
        }
        M = M.mult(1 / this.vertices.length);

        for (let i = 0; i < this.vertices.length; i++)
        {
            this.vertices[i] = this.vertices[i].add(this.vertices[i].sub(M).mult(k))
        }
    }

    draw(ctx, camera)
    {
        if (this.vertices.length < 3)
        {
            return;
        }

        let color = this.color.toHex();
        ctx.fillStyle = color;
        ctx.strokeStyle = color;
        ctx.lineWidth = 7;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();

        let startP = camera.WorldToCanvas(this.vertices[0]);
        ctx.moveTo(startP.x, startP.y);
        for (let i = 0; i < this.vertices.length; i++)
        {
            let index = (i + 1) % this.vertices.length;
            let p = camera.WorldToCanvas(this.vertices[index]);
            ctx.lineTo(p.x, p.y);
        }
        // ctx.fill();
        ctx.stroke();
    }
}
