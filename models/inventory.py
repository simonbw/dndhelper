from models import db


def init_items():
    make_item('Long Sword')
    make_item('Short Sword')
    make_item('Longbow')
    make_item('Shortbow')
    make_item('Rope')
    make_item('Gold Coin', stackable=True)
    make_item('Silver Coin', stackable=True)
    make_item('Copper Coin', stackable=True)
    db.session.commit()


def make_item(name, **kwargs):
    db.session.add(ItemType(name=name, **kwargs))


def list_items():
    """
    :rtype: list[ItemType]
    """
    return ItemType.query.all()


class Inventory(db.Model):
    """
    Contains items.
    """
    id = db.Column(db.Integer, primary_key=True)
    # items

    def __init__(self, *args, **kwargs):
        super(Inventory, *args, **kwargs)
        self._weight = None

    def __iter__(self):
        for item in self.items:
            yield item

    def equipped(self):
        for item in self.items:
            if item.equipped:
                yield item

    def unequipped(self):
        for item in self.items:
            if not item.equipped:
                yield item

    def add_item(self, item_type, quantity=1):
        """
        :type item_type: ItemType
        :type quantity: int
        :rtype: Item
        """
        if item_type.stackable:
            item = Item.query.filter_by(inventory=self, item_type=item_type).first()
            if item:
                item.quantity += quantity
                return item
        return Item(item_type=item_type, quantity=quantity, inventory=self)

    def recalculate_weight(self, force=False):
        if hasattr(self, '_weight') and self._weight is not None and not force:
            pass
        self._weight = 0
        for item in self.items:
            self._weight += item.weight

    @property
    def weight(self):
        """Total weight of all items carried"""
        self.recalculate_weight()
        return self._weight

    def __serialize__(self):
        return self.items


class Item(db.Model):
    """
    A link between an inventory and an item type. Can set the number of items.
    """
    id = db.Column(db.Integer, primary_key=True)
    inventory_id = db.Column(db.Integer, db.ForeignKey('inventory.id'))
    inventory = db.relationship('Inventory', backref='items')  # TODO: lazy load
    item_type_id = db.Column(db.Integer, db.ForeignKey("item_type.id"))
    item_type = db.relationship("ItemType")
    quantity = db.Column(db.Integer, default=1)
    equipped = db.Column(db.Boolean, default=False)

    def __str__(self):
        return self.item_type.name

    def __serialize__(self):
        return {
            'id': self.id,
            'item_type': self.item_type_id,
            'quantity': self.quantity,
            'equipped': self.equipped
        }


class ItemType(db.Model):
    """
    A type of item, like a long sword or a rope.
    """
    id = db.Column(db.Integer, primary_key=True)
    stackable = db.Column(db.Boolean, default=True)
    name = db.Column(db.Text)
    description = db.Column(db.Text)
    weight = db.Column(db.Float)
    value = db.Column(db.Integer)  # Base value of this item in coins

    def __str__(self):
        return self.name

    def __serialize__(self):
        o = {
            'id': self.id,
            'name': self.name,
            'stackable': self.stackable
        }
        if self.description is not None:
            o['description'] = self.description
        if self.value is not None:
            o['value'] = self.value
        if self.weight is not None:
            o['weight'] = self.weight
        return o