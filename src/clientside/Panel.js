

class Panel
{
    constructor(title, parentObj = 'panels')
    {
        this.title = title;
        this.parentObj = parentObj;
        this.element;
        this.isPanelOn = false;
    }

    changeVisibility(show = !this.isPanelOn)
    {
        if (!this.element) return;

        if (show)
        {
            this.element.classList.remove('disabled');
            this.isPanelOn = true;
        }
        else
        {
            this.element.classList.add('disabled');
            this.isPanelOn = false;
        }
    }

    generate(itemsIterable = [])
    {
        const parent = document.getElementById(this.parentObj);
        if (!parent)
        {
            return;
        }

        this.element = document.createElement('div');
        this.element.classList.add('panel');
        this.element.classList.add('no-select');
        this.element.classList.add('disabled');
        parent.appendChild(this.element);

        // title
        const titleEl = document.createElement('h1');
        titleEl.textContent = this.title;
        this.element.appendChild(titleEl);

        for (const item of itemsIterable)
        {
            this.addContent(item);
        }
    }

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