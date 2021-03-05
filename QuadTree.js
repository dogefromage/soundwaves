const Rect = require('./Rect');

const TREE_BUCKET_SIZE = 4;

class QuadTree
{
    constructor(bounds)
    {
        this.bounds = bounds;
        this.root = new QuadNode(this.bounds, 0);
        this.size = 0;
    }

    insert(bounds, data)
    {
        this.root.insert(bounds, data)
        this.size++;
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

    inRange(bounds)
    {
        return this.root.inRange(bounds);
    }

    isEmpty()
    {
        return (this.size == 0);
    }

    clear()
    {
        this.root = new QuadNode(this.bounds, 0);
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

    insert(rect, data)
    {
        const x = { rect, data };
        
        if (this.isLeaf)
        {
            this.data.push(x);
            
            if (this.data.length > TREE_BUCKET_SIZE)
            {
                this.isLeaf = false;

                const temp = this.data;
                this.data = [];
                for (const el of temp)
                {
                    this.insert(el.rect, el.data);
                }
            }
            return;
        }

        let fitsIntoBounds = false;
        for (let i = 0; i < 4; i++)
        {
            if(this.nextbounds[i].containsRect(x.rect))
            {
                if (!this.hasSplit)
                {
                    this.split();
                }

                this.children[i].insert(x.rect, x.data);   // Go deeper into the tree
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
        for (const el of this.data)
        {
            yield el;
        }
    }

    /**
     * Iterator for elements in specified bounds
     * @param {Rect} bounds 
     */
    *inRange(bounds)
    {
        if (!Rect.intersectRect(bounds, this.bounds))
            return;
        
        // RECURSE
        if (this.hasSplit)
        {
            for (const child of this.children)
            {
                for (const el of child.inRange(bounds))
                {
                    yield el;
                }
            }
        }
        
        // YIELD DATA
        for (const el of this.data)
        {
            yield el;
        }
    }
}

module.exports = QuadTree;