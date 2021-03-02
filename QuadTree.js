const Rect = require('./Rect');

const TREE_BUCKET_SIZE = 2;

class QuadTree
{
    constructor(bounds)
    {
        this.root = new QuadNode(bounds, 0);
    }

    insert(x)
    {
        this.root.insert(x)
    }

    draw(ctx)
    {
        this.root.draw(ctx);
    }

    *[Symbol.iterator]()
    {
        const rootIt = this.root[Symbol.iterator]();

        while (true)
        {
            let nextVal = rootIt.next();
            if (nextVal.done)
                break;
            
            yield nextVal.value;            
        }
    }
}

class QuadNode
{
    constructor(bounds, depth)
    {
        this.bounds = bounds;
        const center = { x:bounds.getCenterX(), y:bounds.getCenterY() };
        // already safe for checking next elements
        this.nextbounds = [
            new Rect(bounds.x, bounds.y, 0.5 * bounds.w, 0.5 * bounds.h),
            new Rect(center.x, bounds.y, 0.5 * bounds.w, 0.5 * bounds.h),
            new Rect(bounds.x, center.y, 0.5 * bounds.w, 0.5 * bounds.h),
            new Rect(center.x, center.y, 0.5 * bounds.w, 0.5 * bounds.h)
        ];
        
        this.hasSplit = false;
        this.data = [];
        this.children = [];
        this.isLeaf = true;
        this.depth = depth;
    }

    insert(x)
    {
        if (this.isLeaf)
        {
            this.data.push(x);
            
            if (this.data.length > TREE_BUCKET_SIZE)
            {
                this.isLeaf = false;

                const temp = this.data;
                this.data = [];
                for (const element of temp)
                {
                    this.insert(element);
                }
            }
            return;
        }

        let fitsIntoBounds = false;
        for (let i = 0; i < 4; i++)
        {
            if(this.nextbounds[i].containsRect(x))
            {
                if (!this.hasSplit)
                {
                    this.split();
                }

                this.children[i].insert(x);   // Go deeper into the tree
                fitsIntoBounds = true;
                break;
            }
        }

        if(!fitsIntoBounds)
        {
            this.data.push(x);
        }
    }

    split()
    {
        for (const b of this.nextbounds)
        {
            this.children.push(new QuadNode(b, this.depth + 1));
        }
        
        this.hasSplit = true;
    }

    *[Symbol.iterator]()
    {
        // RECURSE
        if (this.hasSplit)
        {
            for (const child of this.children)
            {
                for (const el of child)
                {
                    yield el;
                }
            }
        }

        // YIELD DATA
        for (const rect of this.data)
        {
            yield { rect, depth:this.depth };
        }
    }

    draw(ctx)
    {
        // POST-ORDER PAINTING

        if (this.hasSplit)
        {
            for (const child of this.children)
            {
                child.draw(ctx);
            }
        }

        let colors = ["#eb2cbf", "#f26f52", "#d811c4", "#2c96fe", "#9ba839", "#41f9ee", "#5c8e91", "#7e71be", "#2c60fb", "#ed344f", "#ec8f5f"];
        ctx.strokeStyle = colors[this.depth % colors.length];

        const { x, y, w, h } = this.bounds;
        ctx.strokeRect(x, y, w, h);
    }
}

module.exports = QuadTree;