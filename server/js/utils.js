'use strict';

const sumSizes = (root) => {
    let sumSize = 0;
    root.forEach(function (value) {
        if(value.size) {
            sumSize += value.size;
        }
    });
    return sumSize;
}

module.exports = {
    normalizeData(root, isRoot) {
        const normalized = [];
        if (isRoot) {
            normalized.push({
                name: 'root',
                size: sumSizes(this.normalizeData(root, false)),
                children: this.normalizeData(root, false)
            });
            return normalized;
        }
        for (let key of Object.keys(root)) {
            if (root[key].hasOwnProperty('elements')) {
                normalized.push({
                    name: key,
                    size: sumSizes(this.normalizeData(root[key].elements, false)),
                    children: this.normalizeData(root[key].elements, false)
                });
            } else {
                normalized.push({
                    size: root[key].size,
                    name: key
                });
            }
        }
        this.isRoot = false;
        return normalized;
    }
}