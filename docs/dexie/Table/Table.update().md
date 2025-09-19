---
layout: docs
title: 'Table.update()'
---

Updates an existing object in the object store with the given changes

### Syntax

```javascript
table.update(key, changes)
```

### Parameters
<table>
<tr><td>key</td><td>Primary key</td></tr>
<tr><td>changes</td><td>Object containing the key paths to each property you want to change.</td></tr>
</table>

### Return Value

A [Promise](/docs/Promise/Promise) with the number of updated records (1 if an object that matches the criteria was found and updated, regardless of whether the update affected the object or not, otherwise 0). A result of 0 indicates that the given key was not found.

### Remarks

Similar to SQL UPDATE. The difference between _update()_ and _put()_ is that _update()_ will only apply the given changes to the object while _put()_ will replace the entire object. Another difference is that if the key is not found, then _put()_ will create a new object while _update()_ will not change anything. The returned Promise will NOT fail if the key was not found but will resolve with a value of 0 instead of 1.

Equivalent to `Table.where(":id").equals(key).modify(changes);`

### Sample

```javascript
db.friends.update(2, {name: "Number 2"}).then(function (updated) {
  if (updated)
    console.log ("Friend number 2 was renamed to Number 2");
  else
    console.log ("Nothing was updated - there was no friend with primary key: 2");
});
```

Note: Be careful with nested object values. If you have an `address` field that includes `city`, `state`, and `zipcode`, then `db.friends.update(2, {address: {zipcode: 12345}})` will replace the entire `address` object with `{zipcode: 12345}`.
If you want to update the zipcode only, then use the dot notation as follows:

```ts
db.friends.update(friendId, {
  "address.zipcode": 12345
});
```

### See Also

[Collection.modify()](/docs/Collection/Collection.modify())

[Table.put()](/docs/Table/Table.put())

[Table.bulkUpdate()](/docs/Table/Table.bulkUpdate())
