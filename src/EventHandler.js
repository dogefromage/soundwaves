
class Event
{
    constructor()
    {
        this.callbacks = new Set();
    }

    add(c)
    {
        this.callbacks.add(c);
        return c;
    }

    remove(c)
    {
        this.callbacks.delete(c);
        return c;
    }

    isEmpty()
    {
        return this.callbacks.size == 0;
    }

    call(event)
    {
        for (const callback of this.callbacks)
        {
            callback(event);
        }
    }
}

class EventHandler
{
    constructor()
    {
        this.events = new Map();
    }

    addEventListener(eventName, callback)
    {
        let event = this.events.get(eventName)
        if (event)
        {
            event.add(callback);
        }
        else
        {
            // add event
            const newEvent = new Event();
            newEvent.add(callback);
            this.events.set(eventName, newEvent);
        }
    }

    removeEventListener(eventName, callback)
    {
        let event = this.events.get(eventName);
        if (event)
        {
            event.remove(callback);
        }

        if (event.isEmpty)
        {
            this.events.delete(eventName);
        }
    }

    call(eventName)
    {
        let event = this.events.get(eventName);
        if (event)
        {
            event.call();
        }
    }
}

module.exports = { EventHandler }