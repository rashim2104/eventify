
import Image from "next/image";


export default function VenueCard(props) {
  const {
    tempVenues,
    handleChange,
    title,
    id,
    slots,
    hasAc,
    hasProjector,
    capacity,
    img,
  } = props;
  const isSlotChecked = (date, session) => {
    return tempVenues.some(
      (tempVenue) =>
        tempVenue.date === date &&
        tempVenue.session === session &&
        tempVenue.venueId === id
    );
  };

  return (
    <div className="flex flex-col gap-4 bg-slate-100 p-3 border rounded-lg">
      <div className="flex flex-col gap-3 sm:flex-row">
        {/* <Image src={img} height={200} width={200} alt="card" /> */}
        <div className="flex flex-col gap-3">
          <p className="text-4xl font-bold">{title}</p>
          <p className="text-justify">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam
            ratione vitae possimus dolor, quae magni, dolores nesciunt,
            voluptatum repudiandae quam sequi debitis harum suscipit quas totam
            perferendis laborum odit unde!
          </p>
          <div className="flex gap-4 flex-col items-start sm:flex-row">
            {hasAc ? (
              <div className="flex gap-1.5 bg-green-100 p-1.5 border rounded-full items-center ">
                <Image
                  src="/assets/icons/air-green.png"
                  height={25}
                  width={25}
                  alt="AC"
                />
                <p>AC</p>
              </div>
            ) : (
              <div className="flex gap-1.5 bg-red-100 p-1.5 border rounded-full items-center">
                <Image
                  src="/assets/icons/air-red.png"
                  height={25}
                  width={25}
                  alt="N-AC"
                />
                <p>AC</p>
              </div>
            )}
            {hasProjector ? (
              <div className="flex gap-1.5 bg-green-100 p-1.5 border rounded-full items-center">
                <Image
                  src="/assets/icons/projector-green.png"
                  height={25}
                  width={25}
                  alt="P"
                />
                <p>Projector</p>
              </div>
            ) : (
              <div className="flex gap-1.5 bg-red-100 p-1.5 border rounded-full items-center">
                <Image
                  src="/assets/icons/projector-red.png"
                  height={25}
                  width={25}
                  alt="N-P"
                />
                <p>Projector</p>
              </div>
            )}
            <div className="flex gap-1.5 bg-yellow-100 p-1.5 border rounded-full">
              <Image
                src="/assets/icons/capacity.png"
                height={25}
                width={25}
                alt="capacity"
              />
              <p>{capacity}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white p-3 border rounded-lg">
        SLOTS
        {slots
          .sort((a, b) => {
            if (a.session === "forenoon" && b.session === "afternoon")
              return -1;
            if (a.session === "afternoon" && b.session === "forenoon") return 1;
            return 0;
          })
          .map((slot, index) => (
            <div key={index}>
              <label
                className={
                  slot.available == 0
                    ? "flex items-center gap-1 cursor-not-allowed !text-red-600"
                    : "flex items-center gap-1"
                }
              >
                <input
                  type="checkbox"
                  className="check-marker"
                  checked={isSlotChecked(slot.date, slot.session)}
                  disabled={
                    (slot.available === 0 || !props.isEdit) &&
                    props.action !== "create"
                  }
                  onChange={(e) =>
                    handleChange(slot, id, e.target.checked, title)
                  }
                />
                {`${slot.date} - ${slot.session.toUpperCase()}`}
              </label>
            </div>
          ))}
      </div>
    </div>
  );
}