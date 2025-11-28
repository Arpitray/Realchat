import { AnimatedTestimonials } from "./animated-testimonials";

export default function CardCarousal() {
  const testimonials = [
    {
      quote:
        "Simply click “Create New Room” and enter a name for your discussion or project A dedicated realtime space is created instantly no setup, no waiting",
      name: "Step 1: Create a Room",
      designation: "",
      src: "https://res.cloudinary.com/dsjjdnife/image/upload/v1764365596/mock1_imgupscaler.ai_V1_Fast__2K_tgveb9.png",
    },
    {
      quote:
        "Once the room is created, you get a Room Link and a Room ID. Press the copy button and share it with teammates, friends, or collaborators.",
      name: "Step 2: Invite Members",
      designation: "",
      src: "https://res.cloudinary.com/dsjjdnife/image/upload/v1764366004/mock2_z9w1mh.png",
    },
    {
      quote:
        "Paste the invite link or Room ID you received, then click Join Room.Instantly enter the shared space no login required, no complexity.",
      name: "Step 3: Join Room",
      designation: "",
      src: "https://res.cloudinary.com/dsjjdnife/image/upload/v1764367005/ChatGPT_Image_Nov_29_2025_03_26_12_AM_accztf.png",
    },
    {
      quote:
        "Once inside, users can create diagrams, brainstorm ideas, plan workflows, or sketch concepts together in real-time using the interactive whiteboard.",
      name: "Work together visually, instantly",
      designation: "",
      src: "https://res.cloudinary.com/dsjjdnife/image/upload/v1764367523/lastMock_qysjt7.png",
    },
  ];
  return (
    <AnimatedTestimonials
      testimonials={testimonials}
      autoplay={true}
      autoplayInterval={6000}
    />
  );
}
