
const fs = require('fs');
const profiler = require('v8-profiler-node8');

module.exports = (time) =>
{
    profiler.startProfiling('probe', true);

    setTimeout(() =>
    {
        const profile = profiler.stopProfiling('probe');
        profile.export((error, result) =>
        {
            fs.writeFileSync('profile.cpuprofile', result);
            profile.delete();
        });
    }, time);
}