

class Panel
{
    constructor(title, content, parentObj = 'panels')
    {
        this.title = title;
        this.parentObj = parentObj;

        const parent = document.getElementById(this.parentObj);

        this.element = document.createElement('div');
        this.element.classList.add('panel');
        this.element.classList.add('no-select');
        parent.appendChild(this.element);

        // title
        const titleEl = document.createElement('h1');
        titleEl.textContent = this.title;
        this.element.appendChild(titleEl);

        for (const item of content)
        {
            this.addContent(item);
        }
    }

    // changeVisibility(show = !this.isPanelOn)
    // {
    //     if (!this.element) return;

    //     if (show)
    //     {
    //         this.element.classList.remove('disabled');
    //         this.isPanelOn = true;
    //     }
    //     else
    //     {
    //         this.element.classList.add('disabled');
    //         this.isPanelOn = false;
    //     }
    // }

    addContent(item)
    {
        if (this.element)
        {
            this.element.appendChild(item);
        }
    }

    destroy()
    {
        if (this.element)
        {
            this.element.parentNode.removeChild(this.element);
        }
    }
}

module.exports = Panel;