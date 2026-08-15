import { FC } from 'react'
import { Skeleton } from '@components/system'
import { StyledSkeletonProfile } from './'

const SkeletonProfile: FC = () => {
  return (
    <StyledSkeletonProfile>
      <div className="skel-card">
        <div className="skel-head">
          <Skeleton height={12} width={72} noBorder />
        </div>
        <div className="skel-identity">
          <Skeleton variant="circular" height={44} width={44} />
          <div className="skel-copy">
            <Skeleton height={16} width={140} noBorder />
            <Skeleton height={12} width={220} noBorder />
          </div>
        </div>
      </div>
      <div className="skel-tabs">
        <Skeleton height={28} width={72} noBorder />
        <Skeleton height={28} width={72} noBorder />
        <Skeleton height={28} width={72} noBorder />
      </div>
      <div className="skel-card">
        <div className="skel-head">
          <Skeleton height={12} width={56} noBorder />
        </div>
        <div className="skel-hero">
          <Skeleton height={56} noBorder />
          <Skeleton height={56} noBorder />
          <Skeleton height={56} noBorder />
        </div>
        <div className="skel-meta">
          <Skeleton height={36} noBorder />
          <Skeleton height={36} noBorder />
          <Skeleton height={36} noBorder />
          <Skeleton height={36} noBorder />
        </div>
      </div>
    </StyledSkeletonProfile>
  )
}

export default SkeletonProfile
