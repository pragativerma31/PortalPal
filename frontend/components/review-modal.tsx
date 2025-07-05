"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
// import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Star } from "lucide-react"

interface StarRatingProps {
  rating: number
  onRatingChange: (rating: number) => void
}

function StarRating({ rating, onRatingChange }: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0)

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className="p-1 hover:scale-110 transition-transform focus:outline-none focus:ring-0"
          onMouseEnter={() => setHoverRating(star)}
          onMouseLeave={() => setHoverRating(0)}
          onClick={() => onRatingChange(star)}
        >
          <Star
            className={`w-8 h-8 transition-colors ${
              star <= (hoverRating || rating)
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300 hover:text-yellow-300"
            }`}
          />
        </button>
      ))}
      <span className="ml-2 text-sm text-muted-foreground">
        {rating > 0 ? `${rating} out of 5 stars` : "No rating"}
      </span>
    </div>
  )
}

interface ReviewModalProps {
  open: boolean
  onClose: () => void
  sessionId: string
}

export default function ReviewModal({ open, onClose, sessionId }: ReviewModalProps) {
  const [rating, setRating] = useState(0)
  const [review, setReview] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch(`http://127.0.0.1:8000/submit-review/${sessionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rating: rating,
          review: review
        }),
      })

      if (response.ok) {
        // Reset form and close modal
        setRating(0)
        setReview("")
        onClose()
        
        // Show success message
        alert("Thank you for your review! Your feedback helps us improve.")
      } else {
        const errorData = await response.json()
        alert(`Error: ${errorData.detail || 'Failed to submit review'}`)
      }
    } catch (error) {
      console.error('Error submitting review:', error)
      alert('Failed to submit review. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    setRating(0)
    setReview("")
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Share Your Experience</DialogTitle>
            <DialogDescription>Help others by sharing your thoughts and rating your experience.</DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="rating">Rating</Label>
              <StarRating rating={rating} onRatingChange={setRating} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="review">Your Review</Label>
              <textarea
                id="review"
                placeholder="Tell us about your experience..."
                value={review}
                onChange={(e) => setReview(e.target.value)}
                className="min-h-[100px] resize-none w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                maxLength={500}
              />
              <div className="text-xs text-muted-foreground text-right">{review.length}/500 characters</div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={handleCancel} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={rating === 0 || isSubmitting} className="min-w-[80px]">
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
