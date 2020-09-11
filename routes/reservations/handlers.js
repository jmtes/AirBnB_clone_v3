const Place = require('../../models/Place');
const Reservation = require('../../models/Reservation');

const getReservationsForPlace = async (req, res) => {
  const { placeID } = req.params;

  try {
    const place = await Place.findById(placeID);

    if (!place) {
      res.status(404).json({ message: 'Place not found.' });
      return;
    }

    if (place.ownerID !== req.user.id) {
      res.status(403).json({ message: 'Invalid credentials.' });
      return;
    }

    const reservations = await Reservation.find({ placeID });

    res.json({ reservations });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ message: 'Something went wrong. Try again later.' });
  }
};

const getReservation = async (req, res) => {
  const { id } = req.params;

  try {
    const reservation = await Reservation.findById(id);

    if (!reservation) {
      res.status(404).json({ message: 'Reservation not found.' });
      return;
    }

    if (
      !(
        reservation.userID === req.user.id ||
        reservation.ownerID === req.user.id
      )
    ) {
      res.status(403).json({ message: 'Invalid credentials.' });
      return;
    }

    res.json(reservation);
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ message: 'Something went wrong. Try again later.' });
  }
};

const makeReservation = async (req, res) => {
  const { placeID } = req.params;

  try {
    const existingReservation = await Reservation.findOne({
      userID: req.user.id,
      placeID
    });

    if (existingReservation) {
      res
        .status(403)
        .json({ message: 'You already have a reservation for this place.' });
      return;
    }

    const place = await Place.findById(placeID);

    if (!place) {
      res.status(404).json({ message: 'Place not found.' });
      return;
    }

    if (place.ownerID === req.user.id) {
      res.status(403).json({
        message: 'You cannot make a reservation for your own place.'
      });
      return;
    }

    let { checkin, checkout } = req.body;

    checkin = new Date(checkin);
    checkout = new Date(checkout);

    const newReservation = new Reservation({
      userID: req.user.id,
      placeID: place._id,
      ownerID: place.ownerID,
      checkin,
      checkout
    });

    const reservation = await newReservation.save();

    res.json(reservation);
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ message: 'Something went wrong. Try again later.' });
  }
};

const editReservation = async (req, res) => {
  const { id } = req.params;

  try {
    let reservation = await Reservation.findById(id);

    if (!reservation) {
      res.status(404).json({ message: 'Reservation not found.' });
      return;
    }

    if (reservation.userID !== req.user.id) {
      res.status(403).json({ message: 'Invalid credentials.' });
      return;
    }

    if (reservation.confirmed) {
      res.status(403).json({
        message:
          'Cannot edit a confirmed reservation. Please cancel your the reservation and make a new one.'
      });
      return;
    }

    if (req.body.checkin) req.body.checkin = new Date(req.body.checkin);
    if (req.body.checkout) req.body.checkout = new Date(req.body.checkout);

    reservation = await Reservation.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, fields: { __v: 0 } }
    );

    res.json(reservation);
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ message: 'Something went wrong. Try again later.' });
  }
};

const cancelReservation = async (req, res) => {
  const { id } = req.params;

  try {
    let reservation = await Reservation.findById(id);

    if (!reservation) {
      res.status(404).json({ message: 'Reservation not found.' });
      return;
    }

    if (reservation.userID !== req.user.id) {
      res.status(403).json({ message: 'Invalid credentials.' });
      return;
    }

    reservation = await Reservation.findByIdAndRemove(id);

    res.json({ message: 'Successfully cancelled reservation.' });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ message: 'Something went wrong. Try again later.' });
  }
};

module.exports = {
  getReservationsForPlace,
  getReservation,
  makeReservation,
  editReservation,
  cancelReservation
};
